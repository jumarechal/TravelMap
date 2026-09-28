import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaces } from '../context/PlacesContext';
import { getSuggestedDestinations } from '../utils/tripSuggestions';
import { colors, radius, spacing, shadow } from '../theme/theme';

const CONTINENT_LABELS = {
  Europe: "l'Europe",
  Asie: "l'Asie",
  Afrique: "l'Afrique",
  Amériques: 'les Amériques',
  Océanie: "l'Océanie",
};

export default function TripPlannerScreen() {
  const { places, homePlaceId } = usePlaces();
  const visitedCountryCodes = useMemo(
    () => [...new Set(places.map((p) => p.countryCode).filter(Boolean))],
    [places]
  );

  const homePlace = useMemo(
    () => places.find((p) => p.id === homePlaceId) || null,
    [places, homePlaceId]
  );
  const homeCoords = useMemo(
    () => (homePlace ? { latitude: homePlace.latitude, longitude: homePlace.longitude } : null),
    [homePlace]
  );

  // Incrémenté pour forcer un nouveau tirage de suggestions
  const [seed, setSeed] = useState(0);
  const suggestions = useMemo(
    () => getSuggestedDestinations(visitedCountryCodes, homeCoords),
    [visitedCountryCodes, homeCoords, seed]
  );

  const hasNearby = suggestions.nearby.length > 0;
  const hasFamiliar = suggestions.familiar.length > 0;
  const hasDiscovery = suggestions.discovery.length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.intro}>
          Des idées de destinations pour ton prochain voyage, à partir de ce que tu as déjà
          exploré.
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={() => setSeed((s) => s + 1)}>
          <Ionicons name="refresh" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {hasNearby ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pas trop loin de chez toi</Text>
          <DestinationGrid countries={suggestions.nearby} />
        </View>
      ) : (
        <View style={styles.hintCard}>
          <Ionicons name="home-outline" size={16} color={colors.textMuted} />
          <Text style={styles.hintText}>
            Marque un lieu comme domicile principal (dans "Mes lieux") pour voir des idées
            classées par distance.
          </Text>
        </View>
      )}

      {hasFamiliar && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Parce que tu connais déjà bien {CONTINENT_LABELS[suggestions.mainContinent]}
          </Text>
          <DestinationGrid countries={suggestions.familiar} />
        </View>
      )}

      {hasDiscovery && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Et si tu changeais d'horizon ?</Text>
          <DestinationGrid countries={suggestions.discovery} />
        </View>
      )}

      {!hasFamiliar && !hasDiscovery && (
        <View style={styles.empty}>
          <Ionicons name="airplane-outline" size={32} color={colors.textMuted} />
          <Text style={styles.emptyText}>
            Impressionnant, il ne reste presque plus rien à découvrir !
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function formatDistance(distanceKm) {
  return `${new Intl.NumberFormat('fr-FR').format(distanceKm)} km`;
}

function DestinationGrid({ countries }) {
  return (
    <View style={styles.grid}>
      {countries.map((country) => (
        <View key={country.code} style={styles.card}>
          <Text style={styles.flag}>{country.flag}</Text>
          <Text style={styles.name} numberOfLines={2}>
            {country.name}
          </Text>
          {typeof country.distanceKm === 'number' && (
            <Text style={styles.distance}>{formatDistance(country.distanceKm)}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  intro: {
    flex: 1,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadow.card,
  },
  flag: { fontSize: 30, marginBottom: 6 },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  distance: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    ...shadow.card,
  },
  hintText: {
    flex: 1,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
