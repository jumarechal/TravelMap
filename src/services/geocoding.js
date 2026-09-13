// Service de géocodage : transforme une adresse en texte libre
// en coordonnées GPS, grâce à l'API gratuite Nominatim (OpenStreetMap).
// Doc de l'API : https://nominatim.org/release-docs/latest/api/Search/

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

// Convertit une adresse texte en { latitude, longitude, displayName, country }
// Lève une erreur (avec un message lisible) si l'adresse n'est pas trouvée.
export async function geocodeAddress(query) {
  const url = `${NOMINATIM_URL}?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      // Nominatim demande d'identifier l'application qui appelle l'API
      // (voir leur politique d'usage : https://operations.osmfoundation.org/policies/nominatim/)
      'User-Agent': 'TravelMapApp/1.0',
      'Accept-Language': 'fr',
    },
  });

  if (!response.ok) {
    throw new Error("Erreur réseau pendant la recherche de l'adresse.");
  }

  const results = await response.json();

  if (!results || results.length === 0) {
    throw new Error('Aucun résultat trouvé pour cette adresse. Essaie d\'être plus précis.');
  }

  const result = results[0];

  return {
    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.lon),
    displayName: result.display_name,
    country: result.address?.country || 'Pays inconnu',
  };
}
