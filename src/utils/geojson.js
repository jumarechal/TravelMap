// Convertit une géométrie GeoJSON (Polygon ou MultiPolygon, comme celles
// renvoyées par Nominatim) en une liste de polygones exploitables par le
// composant <Polygon> de react-native-maps, qui attend des {latitude, longitude}
// (alors que GeoJSON stocke ses coordonnées en [longitude, latitude]).
function ringToLatLng(ring) {
  return ring.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
}

export function geometryToPolygons(geometry) {
  if (!geometry) return [];

  if (geometry.type === 'Polygon') {
    const [outer, ...holes] = geometry.coordinates;
    return [{ coordinates: ringToLatLng(outer), holes: holes.map(ringToLatLng) }];
  }

  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.map(([outer, ...holes]) => ({
      coordinates: ringToLatLng(outer),
      holes: holes.map(ringToLatLng),
    }));
  }

  // Un pays très petit (ex: cité-état) peut ne renvoyer qu'un Point :
  // dans ce cas on ne dessine simplement rien.
  return [];
}
