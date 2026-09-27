import AsyncStorage from '@react-native-async-storage/async-storage';

// Clé utilisée pour stocker la liste des lieux dans AsyncStorage
const STORAGE_KEY = '@travelmap_places';

// Récupère tous les lieux sauvegardés sur l'appareil
export async function getPlaces() {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Erreur lors de la lecture des lieux :', error);
    return [];
  }
}

// Sauvegarde la liste complète des lieux (on réécrit tout à chaque fois,
// ce qui est largement suffisant pour le volume de données d'une appli perso)
export async function savePlaces(places) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(places));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des lieux :', error);
  }
}

// Clé utilisée pour mettre en cache les contours de pays déjà téléchargés
// (pour ne pas les redemander à Nominatim à chaque lancement de l'app)
const BOUNDARIES_STORAGE_KEY = '@travelmap_country_boundaries';

// Récupère le cache des contours de pays : { "France": {...geojson...}, ... }
export async function getCountryBoundaries() {
  try {
    const json = await AsyncStorage.getItem(BOUNDARIES_STORAGE_KEY);
    return json ? JSON.parse(json) : {};
  } catch (error) {
    console.error('Erreur lors de la lecture des contours de pays :', error);
    return {};
  }
}

// Sauvegarde le cache complet des contours de pays
export async function saveCountryBoundaries(boundaries) {
  try {
    await AsyncStorage.setItem(BOUNDARIES_STORAGE_KEY, JSON.stringify(boundaries));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des contours de pays :', error);
  }
}

// Clé utilisée pour retenir quel lieu est le domicile principal
const HOME_PLACE_STORAGE_KEY = '@travelmap_home_place_id';

// Récupère l'id du lieu marqué comme domicile principal (ou null si aucun)
export async function getHomePlaceId() {
  try {
    return await AsyncStorage.getItem(HOME_PLACE_STORAGE_KEY);
  } catch (error) {
    console.error('Erreur lors de la lecture du domicile principal :', error);
    return null;
  }
}

// Sauvegarde l'id du lieu marqué comme domicile principal (ou null pour l'enlever)
export async function saveHomePlaceId(id) {
  try {
    if (id) {
      await AsyncStorage.setItem(HOME_PLACE_STORAGE_KEY, id);
    } else {
      await AsyncStorage.removeItem(HOME_PLACE_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du domicile principal :', error);
  }
}
