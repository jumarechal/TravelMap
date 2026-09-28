import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  getPlaces,
  savePlaces,
  getCountryBoundaries,
  saveCountryBoundaries,
  getHomePlaceId,
  saveHomePlaceId,
} from '../services/storage';
import { fetchCountryBoundary } from '../services/countryBoundaries';
import { reverseGeocodePlaceInfo } from '../services/geocoding';
import { deleteStoredPhoto } from '../services/photoStorage';
import { computeCoveragePercent } from '../services/countryCoverage';
import { getCountryLevel } from '../utils/countryLevel';
import { COUNTRIES_BY_CODE } from '../data/countries';

// Ce contexte centralise la liste des lieux visités (et le contour des pays
// correspondants), pour que l'écran Carte et l'écran Liste partagent toujours
// les mêmes données.
const PlacesContext = createContext(null);

export function PlacesProvider({ children }) {
  const [places, setPlaces] = useState([]);
  const [countryBoundaries, setCountryBoundaries] = useState({});
  const [homePlaceId, setHomePlaceIdState] = useState(null);
  const [loading, setLoading] = useState(true);
  // Cache par pays des statistiques déjà calculées (évite de recalculer la
  // couverture d'un pays qui n'a pas changé quand on modifie un autre pays)
  const countryStatsCacheRef = useRef({});

  // Au premier lancement de l'app, on recharge les lieux et contours déjà sauvegardés
  useEffect(() => {
    (async () => {
      const [storedPlaces, storedBoundaries, storedHomePlaceId] = await Promise.all([
        getPlaces(),
        getCountryBoundaries(),
        getHomePlaceId(),
      ]);
      setPlaces(storedPlaces);
      setCountryBoundaries(storedBoundaries);
      setHomePlaceIdState(storedHomePlaceId);
      setLoading(false);

      // Complète le code pays (ISO) et/ou la ville des lieux ajoutés avant
      // l'introduction de ces champs, qui ne les ont donc pas encore enregistrés
      const placesMissingInfo = storedPlaces.filter((p) => !p.countryCode || !p.city);
      if (placesMissingInfo.length > 0) {
        await backfillPlaceInfo(placesMissingInfo);
      }

      // Si des lieux ont été ajoutés sans que leur pays soit encore en cache
      // (ex: après une réinstallation), on va chercher les contours manquants
      const missingCountries = [...new Set(storedPlaces.map((p) => p.country))].filter(
        (country) => country && !storedBoundaries[country]
      );
      for (const country of missingCountries) {
        await ensureCountryBoundary(country);
      }
    })();
  }, []);

  // Retrouve le code pays (ISO) et/ou la ville d'anciens lieux qui n'en ont
  // pas encore, via un reverse-géocodage sur leurs coordonnées
  const backfillPlaceInfo = async (placesMissingInfo) => {
    for (const place of placesMissingInfo) {
      const info = await reverseGeocodePlaceInfo(place.latitude, place.longitude);
      if (!info) continue;

      setPlaces((current) => {
        const updated = current.map((p) =>
          p.id === place.id
            ? { ...p, countryCode: p.countryCode || info.countryCode, city: p.city || info.city }
            : p
        );
        savePlaces(updated);
        return updated;
      });
    }
  };

  // Télécharge (si besoin) et met en cache le contour d'un pays.
  // On utilise une fonction qui lit toujours le state le plus récent via son
  // paramètre, pour éviter de retélécharger un contour déjà en cache.
  const ensureCountryBoundary = async (country) => {
    if (!country) return;

    let alreadyCached = false;
    setCountryBoundaries((current) => {
      alreadyCached = Boolean(current[country]);
      return current;
    });
    if (alreadyCached) return;

    const geometry = await fetchCountryBoundary(country);
    if (!geometry) return;

    setCountryBoundaries((current) => {
      const updated = { ...current, [country]: geometry };
      saveCountryBoundaries(updated);
      return updated;
    });
  };

  // Ajoute un nouveau lieu à la liste, sauvegarde, puis récupère le contour
  // de son pays s'il n'est pas déjà connu
  const addPlace = async (place) => {
    const updated = [...places, place];
    setPlaces(updated);
    await savePlaces(updated);
    await ensureCountryBoundary(place.country);
  };

  // Remplace les champs d'un lieu existant (après correction de son adresse
  // ou de sa date), puis sauvegarde et récupère le contour du (nouveau) pays
  const updatePlace = async (id, updatedFields) => {
    const updated = places.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
    setPlaces(updated);
    await savePlaces(updated);
    await ensureCountryBoundary(updatedFields.country);
  };

  // Supprime un lieu (par son id) et sauvegarde le résultat
  const removePlace = async (id) => {
    const placeToRemove = places.find((p) => p.id === id);
    const updated = places.filter((p) => p.id !== id);
    setPlaces(updated);
    await savePlaces(updated);

    // Supprime aussi les photos de ce lieu, pour ne pas laisser de fichiers
    // orphelins dans le stockage de l'app
    if (placeToRemove?.photos?.length) {
      await Promise.all(placeToRemove.photos.map((uri) => deleteStoredPhoto(uri)));
    }

    // Si le lieu supprimé était le domicile principal, on l'oublie aussi
    if (id === homePlaceId) {
      setHomePlaceIdState(null);
      await saveHomePlaceId(null);
    }
  };

  // Marque un lieu comme domicile principal (ou l'enlève si on repasse null) :
  // un seul lieu à la fois peut être le domicile
  const setHomePlace = async (id) => {
    setHomePlaceIdState(id);
    await saveHomePlaceId(id);
  };

  // Remplace intégralement les lieux et le domicile principal par ceux d'une
  // sauvegarde restaurée. Invalide le cache de statistiques (tout a changé
  // d'un coup) et va chercher le contour des pays qui ne seraient pas déjà
  // en cache.
  const replaceAllData = async ({ places: newPlaces, homePlaceId: newHomePlaceId }) => {
    setPlaces(newPlaces);
    await savePlaces(newPlaces);
    setHomePlaceIdState(newHomePlaceId || null);
    await saveHomePlaceId(newHomePlaceId || null);
    countryStatsCacheRef.current = {};

    const countries = [...new Set(newPlaces.map((p) => p.country).filter(Boolean))];
    for (const country of countries) {
      await ensureCountryBoundary(country);
    }
  };

  // Statistiques et niveau (0 à 5) de chaque pays où l'on a au moins un lieu.
  // Calculées une seule fois ici (au lieu d'être recalculées indépendamment
  // par chaque écran), et mises en cache par pays : si les lieux d'un pays
  // n'ont pas changé depuis le dernier calcul, on réutilise le résultat au
  // lieu de refaire le calcul de couverture (le plus coûteux).
  const countryStats = useMemo(() => {
    const placesByCode = {};
    places.forEach((place) => {
      if (!place.countryCode) return;
      if (!placesByCode[place.countryCode]) placesByCode[place.countryCode] = [];
      placesByCode[place.countryCode].push(place);
    });

    const byCode = {};
    const byName = {};
    const nextCache = {};

    Object.entries(placesByCode).forEach(([code, countryPlaces]) => {
      const countryName = countryPlaces[0].country;
      const cached = countryStatsCacheRef.current[code];

      const unchanged =
        cached &&
        cached.places.length === countryPlaces.length &&
        cached.places.every((p, i) => p === countryPlaces[i]);

      if (unchanged) {
        nextCache[code] = cached;
        byCode[code] = cached.entry;
        byName[countryName] = cached.entry;
        return;
      }

      const countryInfo = COUNTRIES_BY_CODE[code];
      const cityCount = new Set(countryPlaces.map((p) => p.city).filter(Boolean)).size;
      const coveragePercent = computeCoveragePercent(
        countryPlaces,
        countryInfo?.areaKm2,
        countryInfo?.capital
      );
      const entry = {
        country: countryName,
        countryCode: code,
        placesCount: countryPlaces.length,
        cityCount,
        coveragePercent,
        level: getCountryLevel({ placesCount: countryPlaces.length, cityCount, coveragePercent }),
      };

      nextCache[code] = { places: countryPlaces, entry };
      byCode[code] = entry;
      byName[countryName] = entry;
    });

    countryStatsCacheRef.current = nextCache;
    return { byCode, byName };
  }, [places]);

  return (
    <PlacesContext.Provider
      value={{
        places,
        countryBoundaries,
        countryStats,
        homePlaceId,
        loading,
        addPlace,
        updatePlace,
        removePlace,
        setHomePlace,
        replaceAllData,
      }}
    >
      {children}
    </PlacesContext.Provider>
  );
}

// Hook pratique pour accéder aux lieux depuis n'importe quel écran :
// const { places, countryBoundaries, addPlace, updatePlace, removePlace } = usePlaces();
export function usePlaces() {
  const context = useContext(PlacesContext);
  if (!context) {
    throw new Error('usePlaces() doit être appelé à l\'intérieur de <PlacesProvider>');
  }
  return context;
}
