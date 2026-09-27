import React, { useMemo } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import { usePlaces } from '../context/PlacesContext';
import { COUNTRIES, CONTINENTS } from '../data/countries';

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

// Écran "Passeport" : un badge par pays du monde, regroupés par continent.
// Un badge est en couleur si on a déjà dormi dans ce pays, grisé sinon.
export default function PassportScreen() {
  const { places } = usePlaces();

  // Ensemble des codes pays (ISO) déjà visités, déduit des lieux enregistrés
  const visitedCodes = useMemo(
    () => new Set(places.map((p) => p.countryCode).filter(Boolean)),
    [places]
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
    <SectionList
      style={styles.container}
      sections={sections}
      keyExtractor={(row, index) => `${row[0].code}-row-${index}`}
      stickySectionHeadersEnabled
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={styles.overallHeader}>
          <Text style={styles.overallHeaderText}>
            {totalVisited} / {COUNTRIES.length} pays débloqués au total
          </Text>
        </View>
      }
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{section.continent}</Text>
          <Text style={styles.sectionCount}>
            {section.visitedCount} / {section.totalCount} pays visités
          </Text>
        </View>
      )}
      renderItem={({ item: row }) => (
        <View style={styles.row}>
          {row.map((country) => {
            const visited = visitedCodes.has(country.code);
            return (
              <View key={country.code} style={[styles.badge, !visited && styles.badgeLocked]}>
                <Text style={[styles.flag, !visited && styles.flagLocked]}>{country.flag}</Text>
                <Text style={[styles.name, !visited && styles.nameLocked]} numberOfLines={2}>
                  {country.name}
                </Text>
              </View>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 10, paddingBottom: 20 },
  overallHeader: { paddingVertical: 14, alignItems: 'center' },
  overallHeaderText: { fontSize: 16, fontWeight: '700' },
  sectionHeader: {
    backgroundColor: '#2f6fed',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sectionCount: { color: '#e8f0fe', fontSize: 13, fontWeight: '600' },
  row: { flexDirection: 'row' },
  badge: {
    flex: 1,
    margin: 6,
    minHeight: 92,
    borderRadius: 12,
    backgroundColor: '#fff7e6',
    borderWidth: 1,
    borderColor: '#f5a623',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  badgeLocked: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
  },
  badgeFiller: {
    flex: 1,
    margin: 6,
  },
  flag: { fontSize: 32, marginBottom: 6 },
  flagLocked: { opacity: 0.25 },
  name: { fontSize: 12, textAlign: 'center', fontWeight: '600', color: '#333' },
  nameLocked: { color: '#aaa' },
});
