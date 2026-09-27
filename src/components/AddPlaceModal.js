import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { geocodeAddress } from '../services/geocoding';
import { colors, radius, spacing, shadow } from '../theme/theme';
import DateField from './DateField';

// Fenêtre modale affichée quand on appuie sur le bouton "+".
// Elle permet de saisir une adresse, de la géocoder, puis d'ajouter le lieu.
export default function AddPlaceModal({ visible, onClose, onAdd }) {
  const [query, setQuery] = useState('');
  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClose = () => {
    setQuery('');
    setDate(null);
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
      // 1. On demande à Nominatim de transformer le texte en coordonnées GPS
      const geo = await geocodeAddress(query.trim());

      // 2. On ajoute le nouveau lieu dans le contexte (et donc dans AsyncStorage)
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

          <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
            <Ionicons name="location-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Ex : Hanoï, Vietnam ou 10 rue de la Paix, Paris"
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              autoFocus
              editable={!loading}
            />
          </View>

          <DateField value={date} onChange={setDate} />

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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  inputWrapperError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
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
