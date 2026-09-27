import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MapScreen from '../screens/MapScreen';
import ListScreen from '../screens/ListScreen';
import PassportScreen from '../screens/PassportScreen';
import { colors } from '../theme/theme';

const Tab = createBottomTabNavigator();

// Icône (pleine si l'onglet est actif, contour sinon) pour chaque écran
const TAB_ICONS = {
  Carte: { active: 'map', inactive: 'map-outline' },
  'Mes lieux': { active: 'bookmark', inactive: 'bookmark-outline' },
  Passeport: { active: 'book', inactive: 'book-outline' },
};

// Navigation par onglets en bas d'écran : Carte <-> Mes lieux <-> Passeport
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: colors.background, shadowOpacity: 0, elevation: 0 },
          headerTitleStyle: { color: colors.text, fontWeight: '700', fontSize: 18 },
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 64,
            paddingBottom: 10,
            paddingTop: 6,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarIcon: ({ color, focused }) => {
            const icon = TAB_ICONS[route.name];
            return <Ionicons name={focused ? icon.active : icon.inactive} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Carte" component={MapScreen} />
        <Tab.Screen name="Mes lieux" component={ListScreen} />
        <Tab.Screen name="Passeport" component={PassportScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
