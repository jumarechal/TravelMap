import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getPlaces,
  savePlaces,
  getCountryBoundaries,
  saveCountryBoundaries,
} from '../services/storage';
import { fetchCountryBoundary } from '../services/countryBoundaries';

// Ce contexte centralise la liste des lieux visités (et le contour des pays
// correspondants), pour que l'écran Carte et l'écran Liste partagent toujours
// les mêmes données.
const PlacesContext = createContext(null);

export function PlacesProvider({ children }) {
  const [places, setPlaces] = useState([]);
  const [countryBoundaries, setCountryBoundaries] = useState({});
  const [loading, setLoading] = useState(true);

  // Au premier lancement de l'app, on recharge les lieux et contours déjà sauvegardés
  useEffect(() => {
    (async () => {
      const [storedPlaces, storedBoundaries] = await Promise.all([
        getPlaces(),
        getCountryBoundaries(),
      ]);
      setPlaces(storedPlaces);
      setCountryBoundaries(storedBoundaries);
      setLoading(false);

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

  // Supprime un lieu (par son id) et sauvegarde le résultat
  const removePlace = async (id) => {
    const updated = places.filter((p) => p.id !== id);
    setPlaces(updated);
    await savePlaces(updated);
  };

  return (
    <PlacesContext.Provider
      value={{ places, countryBoundaries, loading, addPlace, removePlace }}
    >
      {children}
    </PlacesContext.Provider>
  );
}

// Hook pratique pour accéder aux lieux depuis n'importe quel écran :
// const { places, countryBoundaries, addPlace, removePlace } = usePlaces();
export function usePlaces() {
  const context = useContext(PlacesContext);
  if (!context) {
    throw new Error('usePlaces() doit être appelé à l\'intérieur de <PlacesProvider>');
  }
  return context;
}
