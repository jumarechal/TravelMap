import React, { useMemo } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaces } from '../context/PlacesContext';
import { COUNTRIES } from '../data/countries';
import { colors, radius, spacing, shadow } from '../theme/theme';

// Formate une date "AAAA-MM-JJ" en "12 mars"
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

// Écran "Chronologie" : une frise verticale des lieux datés, groupés par
// année, avec quelques statistiques par année.
export default function TimelineScreen() {
  const { places } = usePlaces();

  // Seuls les lieux avec une date renseignée peuvent apparaître sur la frise,
  // du plus récent au plus ancien
  const datedPlaces = useMemo(
    () => [...places].filter((p) => p.date).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [places]
  );
  const undatedCount = places.length - datedPlaces.length;

  // Regroupe les lieux datés par année, avec le nombre de pays distincts par année
  const sections = useMemo(() => {
    const groups = {};

    datedPlaces.forEach((place) => {
      const year = place.date.slice(0, 4);
      if (!groups[year]) groups[year] = { year, data: [] };
      groups[year].data.push(place);
    });

    return Object.values(groups)
      .sort((a, b) => Number(b.year) - Number(a.year))
      .map((group) => ({
        ...group,
        countryCount: new Set(group.data.map((p) => p.countryCode || p.country)).size,
      }));
  }, [datedPlaces]);

  if (places.length === 0) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyIcon}>
          <Ionicons name="time-outline" size={28} color={colors.textMuted} />
        </View>
        <Text style={styles.emptyText}>Aucun lieu ajouté pour le moment.</Text>
      </View>
    );
  }

  if (datedPlaces.length === 0) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyIcon}>
          <Ionicons name="time-outline" size={28} color={colors.textMuted} />
        </View>
        <Text style={styles.emptyText}>Aucune date renseignée pour l'instant.</Text>
        <Text style={styles.emptyHint}>
          Modifie un lieu dans "Mes lieux" pour lui ajouter une date et le voir apparaître ici.
        </Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      stickySectionHeadersEnabled={false}
      ListFooterComponent={
        undatedCount > 0 ? (
          <Text style={styles.footerNote}>
            {undatedCount} lieu{undatedCount > 1 ? 'x' : ''} sans date renseignée n'
            {undatedCount > 1 ? 'apparaissent' : 'apparaît'} pas ici.
          </Text>
        ) : null
      }
      renderSectionHeader={({ section }) => (
        <View style={styles.yearHeader}>
          <Text style={styles.yearText}>{section.year}</Text>
          <Text style={styles.yearStats}>
            {section.data.length} lieu{section.data.length > 1 ? 'x' : ''} · {section.countryCount}{' '}
            pays
          </Text>
        </View>
      )}
      renderItem={({ item, index, section }) => {
        const isFirst = index === 0;
        const isLast = index === section.data.length - 1;
        const countryInfo = COUNTRIES.find((c) => c.code === item.countryCode);

        return (
          <View style={styles.timelineRow}>
            <View style={styles.timelineTrack}>
              <View style={[styles.trackLine, isFirst && styles.trackLineHidden]} />
              <View style={styles.dot} />
              <View style={[styles.trackLine, isLast && styles.trackLineHidden]} />
            </View>

            <View style={styles.card}>
              <Text style={styles.date}>{formatDate(item.date)}</Text>
              <View style={styles.cardMain}>
                <Text style={styles.flag}>{countryInfo?.flag || '🌍'}</Text>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.locked,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyText: { color: colors.textMuted, fontSize: 16, textAlign: 'center', fontWeight: '600' },
  emptyHint: { color: colors.textMuted, fontSize: 13, marginTop: 6, textAlign: 'center' },
  list: { padding: spacing.lg, backgroundColor: colors.background },
  footerNote: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  yearHeader: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yearText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  yearStats: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' },
  timelineRow: { flexDirection: 'row' },
  timelineTrack: { width: 24, alignItems: 'center' },
  trackLine: { flex: 1, width: 2, backgroundColor: colors.border },
  trackLineHidden: { backgroundColor: 'transparent' },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginLeft: spacing.sm,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  date: { fontSize: 11, color: colors.textMuted, fontWeight: '700', marginBottom: 4 },
  cardMain: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flag: { fontSize: 18 },
  name: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
});
