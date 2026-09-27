// Service de géocodage : transforme une adresse en texte libre
// en coordonnées GPS, grâce à l'API gratuite Nominatim (OpenStreetMap).
// Doc de l'API : https://nominatim.org/release-docs/latest/api/Search/

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

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
    // Code ISO du pays (ex: "FR"), utilisé pour l'écran Passeport
    countryCode: result.address?.country_code
      ? result.address.country_code.toUpperCase()
      : null,
  };
}

// Retrouve le code pays (ISO) à partir de coordonnées GPS.
// Utilisé pour compléter les lieux enregistrés avant l'ajout du Passeport,
// qui n'ont pas encore de countryCode sauvegardé.
export async function reverseGeocodeCountryCode(latitude, longitude) {
  const url = `${NOMINATIM_REVERSE_URL}?format=json&lat=${latitude}&lon=${longitude}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TravelMapApp/1.0',
        'Accept-Language': 'fr',
      },
    });

    if (!response.ok) return null;

    const result = await response.json();
    return result?.address?.country_code
      ? result.address.country_code.toUpperCase()
      : null;
  } catch (error) {
    console.error('Erreur lors de la récupération du code pays :', error);
    return null;
  }
}
