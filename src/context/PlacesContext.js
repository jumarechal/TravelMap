import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getPlaces,
  savePlaces,
  getCountryBoundaries,
  saveCountryBoundaries,
  getHomePlaceId,
  saveHomePlaceId,
} from '../services/storage';
import { fetchCountryBoundary } from '../services/countryBoundaries';
import { reverseGeocodeCountryCode } from '../services/geocoding';

// Ce contexte centralise la liste des lieux visités (et le contour des pays
// correspondants), pour que l'écran Carte et l'écran Liste partagent toujours
// les mêmes données.
const PlacesContext = createContext(null);

export function PlacesProvider({ children }) {
  const [places, setPlaces] = useState([]);
  const [countryBoundaries, setCountryBoundaries] = useState({});
  const [homePlaceId, setHomePlaceIdState] = useState(null);
  const [loading, setLoading] = useState(true);

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

      // Complète le code pays (ISO) des lieux ajoutés avant l'écran Passeport,
      // qui n'ont donc pas encore ce champ enregistré
      const placesMissingCode = storedPlaces.filter((p) => !p.countryCode);
      if (placesMissingCode.length > 0) {
        await backfillCountryCodes(placesMissingCode);
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

  // Retrouve le code pays (ISO) d'anciens lieux qui n'en ont pas encore,
  // via un reverse-géocodage sur leurs coordonnées, puis sauvegarde le résultat
  const backfillCountryCodes = async (placesMissingCode) => {
    for (const place of placesMissingCode) {
      const countryCode = await reverseGeocodeCountryCode(place.latitude, place.longitude);
      if (!countryCode) continue;

      setPlaces((current) => {
        const updated = current.map((p) => (p.id === place.id ? { ...p, countryCode } : p));
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
    const updated = places.filter((p) => p.id !== id);
    setPlaces(updated);
    await savePlaces(updated);

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

  return (
    <PlacesContext.Provider
      value={{
        places,
        countryBoundaries,
        homePlaceId,
        loading,
        addPlace,
        updatePlace,
        removePlace,
        setHomePlace,
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
