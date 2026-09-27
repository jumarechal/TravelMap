// Récupère le contour géographique (polygone) d'un pays via Nominatim,
// pour pouvoir le colorer sur la carte. On utilise polygon_geojson=1
// pour obtenir la forme, et polygon_threshold pour la simplifier
// (sinon certains pays ont des contours beaucoup trop détaillés).

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export async function fetchCountryBoundary(countryName) {
  const url =
    `${NOMINATIM_URL}?format=json&country=${encodeURIComponent(countryName)}` +
    `&polygon_geojson=1&polygon_threshold=0.01&limit=1`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'TravelMapApp/1.0',
      'Accept-Language': 'fr',
    },
  });

  if (!response.ok) return null;

  const results = await response.json();
  if (!results || results.length === 0 || !results[0].geojson) return null;

  return results[0].geojson;
}
