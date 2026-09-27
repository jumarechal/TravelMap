import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Circle, Polygon } from 'react-native-maps';
import { usePlaces } from '../context/PlacesContext';
import AddPlaceModal from '../components/AddPlaceModal';
import CountrySummary from '../components/CountrySummary';
import { geometryToPolygons } from '../utils/geojson';

// Rayon (en mètres) du cercle "zone connue" dessiné autour de chaque lieu
const KNOWN_ZONE_RADIUS_METERS = 7500;

// Vue de départ de la carte : centrée sur le monde, bien dézoomée
const INITIAL_REGION = {
  latitude: 20,
  longitude: 0,
  latitudeDelta: 90,
  longitudeDelta: 90,
};

// Étendue de la carte utilisée quand on zoome sur un lieu nouvellement ajouté
// (assez large pour bien voir le cercle de 7,5 km autour du point)
const FOCUS_DELTA = 0.4;

// Couleur pâle et discrète utilisée pour mettre en avant, sur la carte,
// les pays où l'on a déjà dormi au moins une fois
const VISITED_COUNTRY_FILL = 'rgba(245, 166, 35, 0.22)';
const VISITED_COUNTRY_STROKE = 'rgba(245, 166, 35, 0.8)';

export default function MapScreen() {
  const { places, countryBoundaries, addPlace } = usePlaces();
  const [modalVisible, setModalVisible] = useState(false);
  const mapRef = useRef(null);

  // Liste des pays distincts déjà visités (déduite des lieux enregistrés)
  const visitedCountries = useMemo(
    () => [...new Set(places.map((p) => p.country).filter(Boolean))],
    [places]
  );

  // Ajoute le lieu, puis anime la carte pour se centrer/zoomer dessus
  const handleAddPlace = async (place) => {
    await addPlace(place);
    mapRef.current?.animateToRegion(
      {
        latitude: place.latitude,
        longitude: place.longitude,
        latitudeDelta: FOCUS_DELTA,
        longitudeDelta: FOCUS_DELTA,
      },
      800
    );
  };

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map} initialRegion={INITIAL_REGION}>
        {/* Contour pâle des pays déjà visités (dessiné avant les markers,
            pour qu'il reste bien "sous" les points) */}
        {visitedCountries.map((country) => {
          const geometry = countryBoundaries[country];
          if (!geometry) return null;

          return geometryToPolygons(geometry).map((polygon, index) => (
            <Polygon
              key={`${country}-${index}`}
              coordinates={polygon.coordinates}
              holes={polygon.holes}
              fillColor={VISITED_COUNTRY_FILL}
              strokeColor={VISITED_COUNTRY_STROKE}
              strokeWidth={1}
            />
          ));
        })}

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

      <View style={styles.summaryOverlay}>
        <CountrySummary />
      </View>

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <AddPlaceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleAddPlace}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  summaryOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
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
