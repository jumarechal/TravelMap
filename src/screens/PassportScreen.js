import React, { useMemo, useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COUNTRIES, CONTINENTS } from '../data/countries';
import { useCountryStats } from '../hooks/useCountryStats';
import CountryStatsModal from '../components/CountryStatsModal';
import TravelerProfile from '../components/TravelerProfile';
import LevelLegendModal from '../components/LevelLegendModal';
import { colors, radius, spacing, shadow, getLevelColor, getLevelTextColor } from '../theme/theme';

// Nombre de badges par ligne
const NUM_COLUMNS = 3;

// Découpe un tableau en petits groupes de `size` éléments,
// pour pouvoir afficher une grille de badges à l'intérieur d'une SectionList
// (qui ne gère pas nativement les colonnes multiples)
function chunk(array, size) {
  const rows = [];
  for (let i = 0; i < array.length; i += size) {
    rows.push(array.slice(i, i + size));
  }
  return rows;
}

// Petite barre de progression horizontale (utilisée pour le score par continent)
function ProgressBar({ progress, color, trackColor }) {
  return (
    <View style={[styles.progressTrack, { backgroundColor: trackColor }]}>
      <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

// Écran "Passeport" : un badge par pays du monde, regroupés par continent.
// La couleur du badge dépend du niveau de connaissance du pays (0 à 5).
export default function PassportScreen({ navigation }) {
  const { byCode: statsByCode } = useCountryStats();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [legendVisible, setLegendVisible] = useState(false);

  const visitedCodes = useMemo(
    () => new Set(Object.keys(statsByCode)),
    [statsByCode]
  );

  // Une section par continent, avec son propre décompte de pays visités
  const sections = useMemo(() => {
    return CONTINENTS.map((continent) => {
      const countries = COUNTRIES.filter((c) => c.continent === continent);
      const visitedCount = countries.filter((c) => visitedCodes.has(c.code)).length;

      return {
        continent,
        visitedCount,
        totalCount: countries.length,
        data: chunk(countries, NUM_COLUMNS),
      };
    });
  }, [visitedCodes]);

  const totalVisited = sections.reduce((sum, section) => sum + section.visitedCount, 0);

  return (
    <>
      <SectionList
        style={styles.container}
        sections={sections}
        keyExtractor={(row, index) => `${row[0].code}-row-${index}`}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.overallHeader}
            >
              <Text style={styles.overallHeaderValue}>
                {totalVisited}
                <Text style={styles.overallHeaderTotal}> / {COUNTRIES.length}</Text>
              </Text>
              <Text style={styles.overallHeaderLabel}>pays débloqués au total</Text>
            </LinearGradient>

            <TravelerProfile statsByCode={statsByCode} />
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity style={styles.legendButton} onPress={() => setLegendVisible(true)}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
            <Text style={styles.legendButtonText}>Comment fonctionnent les niveaux ?</Text>
          </TouchableOpacity>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderTop}>
              <Text style={styles.sectionTitle}>{section.continent}</Text>
              <Text style={styles.sectionCount}>
                {section.visitedCount} / {section.totalCount}
              </Text>
            </View>
            <ProgressBar
              progress={section.totalCount ? section.visitedCount / section.totalCount : 0}
              color={colors.accent}
              trackColor={colors.border}
            />
          </View>
        )}
        renderItem={({ item: row }) => (
          <View style={styles.row}>
            {row.map((country) => {
              const stats = statsByCode[country.code];
              const level = stats?.level || 0;
              const visited = level > 0;
              const badgeColor = visited ? getLevelColor(level) : colors.locked;
              const textColor = visited ? getLevelTextColor(level) : colors.lockedText;

              return (
                <TouchableOpacity
                  key={country.code}
                  disabled={!visited}
                  activeOpacity={0.7}
                  onPress={() => setSelectedCountry(country)}
                  style={[
                    styles.badge,
                    { backgroundColor: badgeColor, borderColor: visited ? badgeColor : colors.lockedBorder },
                  ]}
                >
                  {level === 6 && (
                    <View style={styles.starBadge}>
                      <Ionicons name="star" size={10} color="#fff" />
                    </View>
                  )}
                  <Text style={[styles.flag, !visited && styles.flagLocked]}>{country.flag}</Text>
                  <Text style={[styles.name, { color: textColor }]} numberOfLines={2}>
                    {country.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {/* Complète la dernière ligne d'une section pour garder des badges alignés */}
            {row.length < NUM_COLUMNS &&
              Array.from({ length: NUM_COLUMNS - row.length }).map((_, i) => (
                <View key={`filler-${i}`} style={styles.badgeFiller} />
              ))}
          </View>
        )}
      />

      <CountryStatsModal
        visible={Boolean(selectedCountry)}
        country={selectedCountry}
        stats={selectedCountry ? statsByCode[selectedCountry.code] : null}
        onClose={() => setSelectedCountry(null)}
        onViewPlaces={() => {
          const code = selectedCountry?.code;
          setSelectedCountry(null);
          navigation.navigate('Mes lieux', { focusCountryCode: code });
        }}
      />

      <LevelLegendModal visible={legendVisible} onClose={() => setLegendVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  overallHeader: {
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    ...shadow.floating,
  },
  overallHeaderValue: { color: '#fff', fontSize: 34, fontWeight: '800' },
  overallHeaderTotal: { color: 'rgba(255,255,255,0.7)', fontSize: 20, fontWeight: '600' },
  overallHeaderLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600', marginTop: 4 },
  sectionHeader: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  sectionHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  sectionCount: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  row: { flexDirection: 'row' },
  badge: {
    flex: 1,
    margin: 6,
    minHeight: 92,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  badgeFiller: {
    flex: 1,
    margin: 6,
  },
  flag: { fontSize: 32, marginBottom: 6 },
  flagLocked: { opacity: 0.3 },
  name: { fontSize: 12, textAlign: 'center', fontWeight: '700' },
  starBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: '#D4A017',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 1,
  },
  legendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  legendButtonText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
});
