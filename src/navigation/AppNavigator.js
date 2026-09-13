import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from '../screens/MapScreen';
import ListScreen from '../screens/ListScreen';

const Tab = createBottomTabNavigator();

// Navigation par onglets en bas d'écran : Carte <-> Mes lieux
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Carte" component={MapScreen} />
        <Tab.Screen name="Mes lieux" component={ListScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
