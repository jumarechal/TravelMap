import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { usePlaces } from '../context/PlacesContext';

export default function ListScreen() {
  const { places, removePlace, loading } = usePlaces();

  // Demande une confirmation avant de supprimer un lieu (pour éviter les erreurs de clic)
  const confirmDelete = (place) => {
    Alert.alert('Supprimer ce lieu ?', place.name, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => removePlace(place.id) },
    ]);
  };

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
    <FlatList
      data={places}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.country}>{item.country}</Text>
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
  country: { fontSize: 14, color: '#666', marginTop: 2 },
  deleteButton: {
    backgroundColor: '#e33',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteText: { color: '#fff', fontWeight: '600' },
});
