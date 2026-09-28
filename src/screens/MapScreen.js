import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle, Polygon } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { usePlaces } from '../context/PlacesContext';
import { useCountryStats } from '../hooks/useCountryStats';
import AddPlaceModal from '../components/AddPlaceModal';
import CountrySummary from '../components/CountrySummary';
import SidePanel from '../components/SidePanel';
import { geometryToPolygons } from '../utils/geojson';
import { hexToRgba } from '../utils/color';
import { colors, radius, spacing, shadow, getMapLevelColor } from '../theme/theme';

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

const KNOWN_ZONE_STROKE = hexToRgba(colors.accent, 0.7);
const KNOWN_ZONE_FILL = hexToRgba(colors.accent, 0.12);
const KNOWN_ZONE_DASH = [8, 6];

export default function MapScreen({ navigation }) {
  const { places, countryBoundaries, addPlace } = usePlaces();
  const { byName: statsByName } = useCountryStats();
  const [modalVisible, setModalVisible] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
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
              pinColor={colors.primary}
            />
            <Circle
              center={{ latitude: place.latitude, longitude: place.longitude }}
              radius={KNOWN_ZONE_RADIUS_METERS}
              strokeColor={KNOWN_ZONE_STROKE}
              fillColor={KNOWN_ZONE_FILL}
              lineDashPattern={KNOWN_ZONE_DASH}
            />
          </React.Fragment>
        ))}
      </MapView>

      <View style={styles.summaryOverlay}>
        <CountrySummary />
      </View>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setPanelVisible(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="menu-outline" size={24} color={colors.text} />
      </TouchableOpacity>

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

      <SidePanel visible={panelVisible} onClose={() => setPanelVisible(false)}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Menu</Text>
          <TouchableOpacity onPress={() => setPanelVisible(false)} hitSlop={8}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.panelSectionTitle}>Mes voyages</Text>

        <PanelItem
          icon="time-outline"
          title="Chronologie"
          subtitle="La frise de tous tes voyages, année par année"
          onPress={() => {
            setPanelVisible(false);
            navigation.navigate('Timeline');
          }}
        />
        <PanelItem
          icon="airplane-outline"
          title="Planifier mon voyage"
          subtitle="Des idées de destinations selon tes voyages passés"
          onPress={() => {
            setPanelVisible(false);
            navigation.navigate('TripPlanner');
          }}
        />
      </SidePanel>
    </View>
  );
}

function PanelItem({ icon, title, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.panelItem} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.panelItemIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.panelItemText}>
        <Text style={styles.panelItemTitle}>{title}</Text>
        <Text style={styles.panelItemSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  summaryOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
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
  menuButton: {
    position: 'absolute',
    left: 16,
    top: 16,
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.primary,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  panelSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  panelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    gap: spacing.md,
    ...shadow.card,
  },
  panelItemIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelItemText: { flex: 1 },
  panelItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  panelItemSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
