import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { usePlaces } from '../context/PlacesContext';
import CountrySummary from '../components/CountrySummary';
import { COUNTRIES } from '../data/countries';

export default function ListScreen({ route }) {
  const { places, removePlace, loading } = usePlaces();
  const sectionListRef = useRef(null);

  // Demande une confirmation avant de supprimer un lieu (pour éviter les erreurs de clic)
  const confirmDelete = (place) => {
    Alert.alert('Supprimer ce lieu ?', place.name, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => removePlace(place.id) },
    ]);
  };

  // Regroupe les lieux par pays : une section = une bannière de pays
  const sections = useMemo(() => {
    const groups = {};

    places.forEach((place) => {
      const key = place.countryCode || place.country || 'inconnu';
      if (!groups[key]) {
        const countryInfo = COUNTRIES.find((c) => c.code === place.countryCode);
        groups[key] = {
          key,
          countryCode: place.countryCode,
          title: place.country || 'Pays inconnu',
          flag: countryInfo?.flag || '🌍',
          data: [],
        };
      }
      groups[key].data.push(place);
    });

    return Object.values(groups).sort((a, b) => a.title.localeCompare(b.title));
  }, [places]);

  // Si on arrive depuis l'écran Passeport pour un pays précis, on scrolle
  // automatiquement jusqu'à la bannière de ce pays
  useEffect(() => {
    const targetCode = route?.params?.focusCountryCode;
    if (!targetCode) return;

    const sectionIndex = sections.findIndex((s) => s.countryCode === targetCode);
    if (sectionIndex === -1) return;

    // Petit délai pour laisser la liste se rendre avant de scroller
    const timer = setTimeout(() => {
      sectionListRef.current?.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        viewPosition: 0,
        animated: true,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [route?.params?.focusCountryCode, sections]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (places.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Aucun lieu ajouté pour le moment.</Text>
        <Text style={styles.emptyHint}>Utilise le bouton "+" sur la carte pour en ajouter un.</Text>
      </View>
    );
  }

  return (
    <SectionList
      ref={sectionListRef}
      sections={sections}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      stickySectionHeadersEnabled
      onScrollToIndexFailed={() => {}}
      ListHeaderComponent={
        <View style={styles.summaryContainer}>
          <CountrySummary />
        </View>
      }
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionFlag}>{section.flag}</Text>
          <Text style={styles.sectionTitle} numberOfLines={1}>
            {section.title}
          </Text>
          <Text style={styles.sectionCount}>
            {section.data.length} lieu{section.data.length > 1 ? 'x' : ''}
          </Text>
        </View>
      )}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.name}>{item.name}</Text>
          </View>
          <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.deleteButton}>
            <Text style={styles.deleteText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { color: '#888', fontSize: 16, textAlign: 'center' },
  emptyHint: { color: '#aaa', fontSize: 14, marginTop: 6, textAlign: 'center' },
  list: { padding: 16 },
  summaryContainer: { marginBottom: 12, alignItems: 'flex-start' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2f6fed',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 12,
    marginBottom: 8,
  },
  sectionFlag: { fontSize: 20, marginRight: 8 },
  sectionTitle: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '700' },
  sectionCount: { color: '#e8f0fe', fontSize: 13, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  rowText: { flex: 1, marginRight: 10 },
  name: { fontSize: 16, fontWeight: '600' },
  deleteButton: {
    backgroundColor: '#e33',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteText: { color: '#fff', fontWeight: '600' },
});
