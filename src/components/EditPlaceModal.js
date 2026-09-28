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
import { geocodeAddress } from '../services/geocoding';
import { storePhoto, isStoredPhoto, deleteStoredPhoto } from '../services/photoStorage';
import { colors, radius, spacing, shadow } from '../theme/theme';
import AddressAutocomplete from './AddressAutocomplete';
import DateField from './DateField';
import NoteField from './NoteField';
import PhotoPicker from './PhotoPicker';

// Fenêtre modale pour corriger un lieu déjà enregistré : son adresse
// (re-géocodée, au cas où elle change), sa date, sa note et ses photos.
export default function EditPlaceModal({ visible, place, onClose, onSave }) {
  const [query, setQuery] = useState('');
  // Lieu choisi dans les suggestions d'autocomplétion (évite de re-géocoder
  // le texte et lève l'ambiguïté entre deux lieux du même nom)
  const [selectedGeo, setSelectedGeo] = useState(null);
  const [date, setDate] = useState(null);
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pré-remplit le formulaire avec le lieu à modifier chaque fois qu'on l'ouvre
  useEffect(() => {
    if (place) {
      setQuery(place.name);
      setSelectedGeo(null);
      setDate(place.date ? new Date(place.date) : null);
      setNote(place.note || '');
      setPhotos(place.photos || []);
      setError(null);
    }
  }, [place]);

  const handleClose = () => {
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
      const geo = selectedGeo || (await geocodeAddress(query.trim()));

      // Copie les photos nouvellement ajoutées dans le stockage de l'app
      // (celles déjà stockées le sont déjà, on ne les retouche pas)
      const finalPhotos = await Promise.all(
        photos.map((uri) => (isStoredPhoto(uri) ? uri : storePhoto(uri)))
      );

      // Supprime les fichiers des photos retirées pendant cette édition
      const removedPhotos = (place.photos || []).filter((uri) => !photos.includes(uri));
      await Promise.all(removedPhotos.map((uri) => deleteStoredPhoto(uri)));

      await onSave(place.id, {
        name: query.trim(),
        displayName: geo.displayName,
        country: geo.country,
        countryCode: geo.countryCode,
        city: geo.city,
        latitude: geo.latitude,
        longitude: geo.longitude,
        date: date ? date.toISOString().slice(0, 10) : null,
        note: note.trim() || null,
        photos: finalPhotos,
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
              <Ionicons name="create-outline" size={18} color={colors.primary} />
            </View>
            <Text style={styles.title}>Modifier ce lieu</Text>
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
            placeholder="Ex : Hanoï, Vietnam ou 10 rue de la Paix, Paris"
            editable={!loading}
            error={error}
          />

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
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Enregistrer</Text>
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
    minWidth: 120,
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
