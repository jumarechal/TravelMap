import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { geocodeAddress, reverseGeocode } from '../services/geocoding';
import { storePhoto } from '../services/photoStorage';
import { colors, radius, spacing, shadow } from '../theme/theme';
import AddressAutocomplete from './AddressAutocomplete';
import DateField from './DateField';
import NoteField from './NoteField';
import PhotoPicker from './PhotoPicker';

// Fenêtre modale affichée quand on appuie sur le bouton "+", ou quand on fait
// un appui long sur la carte (initialCoordinate est alors fourni : l'adresse
// est retrouvée automatiquement à partir de ce point).
// Elle permet de saisir une adresse, de la géocoder, puis d'ajouter le lieu.
export default function AddPlaceModal({ visible, onClose, onAdd, initialCoordinate }) {
  const [query, setQuery] = useState('');
  // Lieu choisi dans les suggestions d'autocomplétion (évite de re-géocoder
  // le texte et lève l'ambiguïté entre deux lieux du même nom)
  const [selectedGeo, setSelectedGeo] = useState(null);
  const [date, setDate] = useState(null);
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resolvingCoordinate, setResolvingCoordinate] = useState(false);
  const [error, setError] = useState(null);

  // Appui long sur la carte : on retrouve l'adresse à partir du point choisi
  // et on pré-remplit le champ, plutôt que de laisser l'utilisateur taper
  useEffect(() => {
    if (!visible || !initialCoordinate) return;

    setResolvingCoordinate(true);
    setError(null);

    reverseGeocode(initialCoordinate.latitude, initialCoordinate.longitude)
      .then((geo) => {
        setQuery(geo.city ? `${geo.city}, ${geo.country}` : geo.displayName.split(',')[0].trim());
        setSelectedGeo(geo);
      })
      .catch(() => {
        setError("Adresse introuvable à cet endroit, tu peux la saisir manuellement.");
      })
      .finally(() => setResolvingCoordinate(false));
  }, [visible, initialCoordinate]);

  const handleClose = () => {
    setQuery('');
    setSelectedGeo(null);
    setDate(null);
    setNote('');
    setPhotos([]);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!query.trim()) {
      setError('Merci de saisir une adresse ou un nom de lieu.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Coordonnées GPS : celles de la suggestion choisie si l'utilisateur
      // en a sélectionné une, sinon on géocode le texte saisi
      const geo = selectedGeo || (await geocodeAddress(query.trim()));

      // 2. On copie les photos choisies dans le stockage propre à l'app
      const storedPhotos = await Promise.all(photos.map((uri) => storePhoto(uri)));

      // 3. On ajoute le nouveau lieu dans le contexte (et donc dans AsyncStorage)
      await onAdd({
        id: Date.now().toString(),
        name: query.trim(),
        displayName: geo.displayName,
        country: geo.country,
        countryCode: geo.countryCode,
        city: geo.city,
        latitude: geo.latitude,
        longitude: geo.longitude,
        // Date au format AAAA-MM-JJ, ou null si non renseignée
        date: date ? date.toISOString().slice(0, 10) : null,
        note: note.trim() || null,
        photos: storedPhotos,
      });

      handleClose();
    } catch (err) {
      setError(err.message || 'Une erreur est survenue, réessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <View style={styles.handle} />

          <View style={styles.titleRow}>
            <View style={styles.titleIcon}>
              <Ionicons name="bed-outline" size={18} color={colors.primary} />
            </View>
            <Text style={styles.title}>Ajouter un lieu où j'ai dormi</Text>
          </View>

          <AddressAutocomplete
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              setSelectedGeo(null);
            }}
            onSelectSuggestion={(suggestion) => {
              setQuery(suggestion.label);
              setSelectedGeo(suggestion);
            }}
            placeholder={
              resolvingCoordinate
                ? "Recherche de l'adresse..."
                : 'Ex : Hanoï, Vietnam ou 10 rue de la Paix, Paris'
            }
            autoFocus={!initialCoordinate}
            editable={!loading && !resolvingCoordinate}
            error={error}
          />
          {resolvingCoordinate && (
            <View style={styles.resolvingRow}>
              <ActivityIndicator size="small" color={colors.textMuted} />
              <Text style={styles.resolvingText}>Recherche de l'adresse à cet endroit...</Text>
            </View>
          )}

          <ScrollView style={styles.scrollArea} keyboardShouldPersistTaps="handled">
            <DateField value={date} onChange={setDate} />
            <View style={styles.fieldSpacer}>
              <NoteField value={note} onChange={setNote} />
            </View>
            <View style={styles.fieldSpacer}>
              <PhotoPicker photos={photos} onChange={setPhotos} />
            </View>
          </ScrollView>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose} disabled={loading}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (loading || resolvingCoordinate) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading || resolvingCoordinate}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Ajouter</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(29, 32, 48, 0.5)',
  },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: 36,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  titleIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  resolvingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  resolvingText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  scrollArea: {
    maxHeight: 280,
    marginTop: spacing.md,
  },
  fieldSpacer: {
    marginTop: spacing.md,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.sm,
    fontSize: 13,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.lg,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    minWidth: 100,
    alignItems: 'center',
    marginLeft: spacing.sm,
    ...shadow.card,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
