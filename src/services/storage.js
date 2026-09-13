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
