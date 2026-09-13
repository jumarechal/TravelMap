import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PlacesProvider } from './src/context/PlacesContext';
import AppNavigator from './src/navigation/AppNavigator';

// Point d'entrée de l'application : on englobe toute la navigation
// dans le PlacesProvider pour que tous les écrans partagent les mêmes lieux.
export default function App() {
  return (
    <PlacesProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </PlacesProvider>
  );
}
