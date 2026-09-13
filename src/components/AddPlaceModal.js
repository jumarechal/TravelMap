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
import { geocodeAddress } from '../services/geocoding';

// Fenêtre modale affichée quand on appuie sur le bouton "+".
// Elle permet de saisir une adresse, de la géocoder, puis d'ajouter le lieu.
export default function AddPlaceModal({ visible, onClose, onAdd }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClose = () => {
    setQuery('');
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
        latitude: geo.latitude,
        longitude: geo.longitude,
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
          <Text style={styles.title}>Ajouter un lieu où j'ai dormi</Text>

          <TextInput
            style={styles.input}
            placeholder="Ex : Hanoï, Vietnam ou 10 rue de la Paix, Paris"
            value={query}
            onChangeText={setQuery}
            autoFocus
            editable={!loading}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose} disabled={loading}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  error: {
    color: '#d33',
    marginTop: 8,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#2f6fed',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 90,
    alignItems: 'center',
    marginLeft: 12,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
