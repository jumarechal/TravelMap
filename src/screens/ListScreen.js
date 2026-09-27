import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaces } from '../context/PlacesContext';
import CountrySummary from '../components/CountrySummary';
import { COUNTRIES } from '../data/countries';
import { colors, radius, spacing, shadow } from '../theme/theme';

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
        <Text style={styles.emptyText}>Chargement...</Text>
      </View>
    );
  }

  if (places.length === 0) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyIcon}>
          <Ionicons name="bed-outline" size={28} color={colors.textMuted} />
        </View>
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
      stickySectionHeadersEnabled={false}
      onScrollToIndexFailed={() => {}}
      ListHeaderComponent={
        <View style={styles.summaryContainer}>
          <CountrySummary />
        </View>
      }
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <View style={styles.sectionFlagBadge}>
            <Text style={styles.sectionFlag}>{section.flag}</Text>
          </View>
          <Text style={styles.sectionTitle} numberOfLines={1}>
            {section.title}
          </Text>
          <View style={styles.sectionCountPill}>
            <Text style={styles.sectionCount}>{section.data.length}</Text>
          </View>
        </View>
      )}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="bed-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.name}>{item.name}</Text>
          </View>
          <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      )}
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
  summaryContainer: { marginBottom: spacing.md, alignItems: 'flex-start' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionFlagBadge: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    ...shadow.card,
  },
  sectionFlag: { fontSize: 15 },
  sectionTitle: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '700' },
  sectionCountPill: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  sectionCount: { color: colors.primaryDark, fontSize: 12, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rowText: { flex: 1, marginRight: spacing.sm },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
