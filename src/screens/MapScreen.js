import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle, Polygon } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { usePlaces } from '../context/PlacesContext';
import { useCountryStats } from '../hooks/useCountryStats';
import AddPlaceModal from '../components/AddPlaceModal';
import CountrySummary from '../components/CountrySummary';
import { geometryToPolygons } from '../utils/geojson';
import { hexToRgba } from '../utils/color';
import { colors, shadow, getMapLevelColor } from '../theme/theme';

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

const KNOWN_ZONE_STROKE = 'rgba(76, 95, 224, 0.6)';
const KNOWN_ZONE_FILL = 'rgba(76, 95, 224, 0.15)';

export default function MapScreen() {
  const { places, countryBoundaries, addPlace } = usePlaces();
  const { byName: statsByName } = useCountryStats();
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

          const level = statsByName[country]?.level || 1;
          const baseColor = getMapLevelColor(level);

          return geometryToPolygons(geometry).map((polygon, index) => (
            <Polygon
              key={`${country}-${index}`}
              coordinates={polygon.coordinates}
              holes={polygon.holes}
              fillColor={hexToRgba(baseColor, 0.55)}
              strokeColor={hexToRgba(baseColor, 1)}
              strokeWidth={1.5}
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
              strokeColor={KNOWN_ZONE_STROKE}
              fillColor={KNOWN_ZONE_FILL}
            />
          </React.Fragment>
        ))}
      </MapView>

      <View style={styles.summaryOverlay}>
        <CountrySummary />
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#fff" />
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
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.floating,
  },
});
