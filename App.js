import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PlacesProvider } from './src/context/PlacesContext';
import AppNavigator from './src/navigation/AppNavigator';

// Point d'entrée de l'application : on englobe toute la navigation
// dans le PlacesProvider pour que tous les écrans partagent les mêmes lieux.
// SafeAreaProvider permet aux écrans de connaître les zones sûres (encoche,
// barre de statut...), utilisé notamment par le panel glissant.
export default function App() {
  return (
    <SafeAreaProvider>
      <PlacesProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </PlacesProvider>
    </SafeAreaProvider>
  );
}
