import React, { createContext, useContext, useEffect, useState } from 'react';
import { getPlaces, savePlaces } from '../services/storage';

// Ce contexte centralise la liste des lieux visités, pour que l'écran
// Carte et l'écran Liste partagent toujours les mêmes données.
const PlacesContext = createContext(null);

export function PlacesProvider({ children }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  // Au premier lancement de l'app, on recharge les lieux déjà sauvegardés
  useEffect(() => {
    (async () => {
      const stored = await getPlaces();
      setPlaces(stored);
      setLoading(false);
    })();
  }, []);

  // Ajoute un nouveau lieu à la liste et sauvegarde tout de suite sur l'appareil
  const addPlace = async (place) => {
    const updated = [...places, place];
    setPlaces(updated);
    await savePlaces(updated);
  };

  // Supprime un lieu (par son id) et sauvegarde le résultat
  const removePlace = async (id) => {
    const updated = places.filter((p) => p.id !== id);
    setPlaces(updated);
    await savePlaces(updated);
  };

  return (
    <PlacesContext.Provider value={{ places, loading, addPlace, removePlace }}>
      {children}
    </PlacesContext.Provider>
  );
}

// Hook pratique pour accéder aux lieux depuis n'importe quel écran :
// const { places, addPlace, removePlace } = usePlaces();
export function usePlaces() {
  const context = useContext(PlacesContext);
  if (!context) {
    throw new Error('usePlaces() doit être appelé à l\'intérieur de <PlacesProvider>');
  }
  return context;
}
