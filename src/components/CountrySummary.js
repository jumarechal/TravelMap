import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaces } from '../context/PlacesContext';
import { colors, radius, spacing, shadow } from '../theme/theme';

// Petit badge qui affiche le nombre de pays visités,
// déduit du nombre de pays différents parmi les lieux enregistrés.
export default function CountrySummary() {
  const { places } = usePlaces();
  const countryCount = new Set(places.map((p) => p.country)).size;

  return (
    <View style={styles.container}>
      <Ionicons name="earth" size={16} color={colors.primary} style={styles.icon} />
      <Text style={styles.text}>
        {countryCount} pays visité{countryCount > 1 ? 's' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    ...shadow.card,
  },
  icon: { marginRight: 6 },
  text: {
    fontWeight: '700',
    fontSize: 13,
    color: colors.text,
  },
});
