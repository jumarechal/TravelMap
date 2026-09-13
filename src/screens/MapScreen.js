import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { usePlaces } from '../context/PlacesContext';
import AddPlaceModal from '../components/AddPlaceModal';

// Rayon (en mètres) du cercle "zone connue" dessiné autour de chaque lieu
const KNOWN_ZONE_RADIUS_METERS = 7500;

// Vue de départ de la carte : centrée sur le monde, bien dézoomée
const INITIAL_REGION = {
  latitude: 20,
  longitude: 0,
  latitudeDelta: 90,
  longitudeDelta: 90,
};

export default function MapScreen() {
  const { places, addPlace } = usePlaces();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={INITIAL_REGION}>
        {places.map((place) => (
          // Un Fragment permet de regrouper le marker et son cercle
          // sans ajouter de vue supplémentaire inutile
          <React.Fragment key={place.id}>
            <Marker
              coordinate={{ latitude: place.latitude, longitude: place.longitude }}
              title={place.name}
              description={place.country}
            />
            <Circle
              center={{ latitude: place.latitude, longitude: place.longitude }}
              radius={KNOWN_ZONE_RADIUS_METERS}
              strokeColor="rgba(47, 111, 237, 0.6)"
              fillColor="rgba(47, 111, 237, 0.15)"
            />
          </React.Fragment>
        ))}
      </MapView>

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <AddPlaceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={addPlace}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2f6fed',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  addButtonText: {
    color: '#fff',
    fontSize: 30,
    lineHeight: 32,
  },
});
