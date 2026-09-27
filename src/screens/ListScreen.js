import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  SectionList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaces } from '../context/PlacesContext';
import CountrySummary from '../components/CountrySummary';
import EditPlaceModal from '../components/EditPlaceModal';
import PhotoViewerModal from '../components/PhotoViewerModal';
import { COUNTRIES } from '../data/countries';
import { normalize } from '../utils/text';
import { colors, radius, spacing, shadow } from '../theme/theme';

export default function ListScreen({ route }) {
  const { places, homePlaceId, updatePlace, removePlace, setHomePlace, loading } = usePlaces();
  const sectionListRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPlace, setEditingPlace] = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [viewingPhotos, setViewingPhotos] = useState(null);

  // Affiche/masque l'adresse complète d'un lieu sous son nom de ville
  const toggleExpanded = (id) => {
    setExpandedIds((current) => {
      const updated = new Set(current);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  // Demande une confirmation avant de supprimer un lieu (pour éviter les erreurs de clic)
  const confirmDelete = (place) => {
    Alert.alert('Supprimer ce lieu ?', place.name, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => removePlace(place.id) },
    ]);
  };

  // Regroupe les lieux par pays : une section = une bannière de pays
  const sections = useMemo(() => {
    const query = normalize(searchQuery.trim());

    const filteredPlaces = query
      ? places.filter(
          (place) =>
            normalize(place.name).includes(query) ||
            normalize(place.city || '').includes(query) ||
            normalize(place.country || '').includes(query)
        )
      : places;

    const groups = {};

    filteredPlaces.forEach((place) => {
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
  }, [places, searchQuery]);

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
    <>
      <SectionList
        ref={sectionListRef}
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        onScrollToIndexFailed={() => {}}
        ListHeaderComponent={
          <View>
            <View style={styles.summaryContainer}>
              <CountrySummary />
            </View>

            <View style={styles.searchWrapper}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un lieu ou un pays"
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {sections.length === 0 && (
              <Text style={styles.noResults}>Aucun résultat pour "{searchQuery}"</Text>
            )}
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
        renderItem={({ item }) => {
          const isHome = item.id === homePlaceId;
          const displayTitle = item.city || item.name;
          // On ne propose de déplier que si l'adresse saisie apporte une
          // information de plus que le simple nom de ville affiché, ou s'il
          // y a une note/des photos à montrer
          const hasAddressDetail =
            item.city && normalize(item.city) !== normalize(item.name);
          const hasPhotos = item.photos && item.photos.length > 0;
          const canExpand = hasAddressDetail || Boolean(item.note) || hasPhotos;
          const isExpanded = expandedIds.has(item.id);

          return (
            <View style={[styles.card, isHome && styles.cardHome]}>
              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.rowMain}
                  activeOpacity={canExpand ? 0.6 : 1}
                  onPress={() => canExpand && toggleExpanded(item.id)}
                >
                  <View style={[styles.rowIcon, isHome && styles.rowIconHome]}>
                    <Ionicons
                      name={isHome ? 'home' : 'bed-outline'}
                      size={18}
                      color={isHome ? colors.accentDark : colors.primary}
                    />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={[styles.name, isHome && styles.nameHome]}>{displayTitle}</Text>
                    {isHome && <Text style={styles.homeLabel}>Domicile principal</Text>}
                  </View>
                  {canExpand && (
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={colors.textMuted}
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setHomePlace(isHome ? null : item.id)}
                  style={styles.homeButton}
                >
                  <Ionicons
                    name={isHome ? 'home' : 'home-outline'}
                    size={18}
                    color={isHome ? colors.accent : colors.textMuted}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditingPlace(item)} style={styles.editButton}>
                  <Ionicons name="create-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>

              {canExpand && isExpanded && (
                <View style={styles.expandedBlock}>
                  {hasAddressDetail && (
                    <View style={styles.expandedRow}>
                      <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                      <Text style={styles.expandedText}>{item.name}</Text>
                    </View>
                  )}
                  {item.note && (
                    <View style={styles.expandedRow}>
                      <Ionicons name="document-text-outline" size={14} color={colors.textMuted} />
                      <Text style={styles.expandedText}>{item.note}</Text>
                    </View>
                  )}
                  {hasPhotos && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosRow}>
                      {item.photos.map((uri, index) => (
                        <TouchableOpacity
                          key={uri}
                          onPress={() => setViewingPhotos({ photos: item.photos, index })}
                        >
                          <Image source={{ uri }} style={styles.photoThumb} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              )}
            </View>
          );
        }}
      />

      <EditPlaceModal
        visible={Boolean(editingPlace)}
        place={editingPlace}
        onClose={() => setEditingPlace(null)}
        onSave={updatePlace}
      />

      <PhotoViewerModal
        visible={Boolean(viewingPhotos)}
        photos={viewingPhotos?.photos}
        initialIndex={viewingPhotos?.index || 0}
        onClose={() => setViewingPhotos(null)}
      />
    </>
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
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.text },
  noResults: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.lg,
  },
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  cardHome: {
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  rowIconHome: {
    backgroundColor: '#fff',
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: { flex: 1, marginRight: spacing.sm },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  nameHome: { fontWeight: '800', color: colors.accentDark },
  homeLabel: { fontSize: 11, fontWeight: '700', color: colors.accentDark, marginTop: 2 },
  expandedBlock: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  expandedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  expandedText: { flex: 1, fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  photosRow: { flexGrow: 0 },
  photoThumb: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    marginRight: spacing.sm,
    backgroundColor: colors.locked,
  },
  homeButton: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  editButton: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
