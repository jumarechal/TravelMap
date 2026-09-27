// Service de géocodage : transforme une adresse en texte libre
// en coordonnées GPS, grâce à l'API gratuite Nominatim (OpenStreetMap).
// Doc de l'API : https://nominatim.org/release-docs/latest/api/Search/

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

// Déduit un nom de ville "utilisable" à partir de l'adresse renvoyée par
// Nominatim (les petites communes n'ont pas toujours de champ "city")
function extractCity(address) {
  if (!address) return null;
  return address.city || address.town || address.village || address.municipality || address.county || null;
}

// Convertit une adresse texte en { latitude, longitude, displayName, country, city }
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
    // Ville (ou équivalent), utilisée pour distinguer les niveaux de
    // connaissance d'un pays sur le Passeport
    city: extractCity(result.address),
  };
}

// Retrouve le code pays (ISO) et la ville à partir de coordonnées GPS.
// Utilisé pour compléter les lieux enregistrés avant l'ajout de ces champs,
// qui ne les ont donc pas encore sauvegardés.
export async function reverseGeocodePlaceInfo(latitude, longitude) {
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
    if (!result?.address) return null;

    return {
      countryCode: result.address.country_code
        ? result.address.country_code.toUpperCase()
        : null,
      city: extractCity(result.address),
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des informations du lieu :', error);
    return null;
  }
}
