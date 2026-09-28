// Service de sauvegarde/restauration : regroupe les lieux (avec leurs
// photos) dans un fichier .zip que l'on peut enregistrer où l'on veut
// (Drive, email, stockage local...), et sait relire ce même fichier pour
// tout restaurer. Aucun compte ni serveur : tout se passe sur l'appareil.
import { File, Directory, Paths } from 'expo-file-system';
import JSZip from 'jszip';
import { getPlaces, getHomePlaceId } from './storage';
import { isStoredPhoto, storePhotoBytes } from './photoStorage';

const BACKUP_FORMAT_VERSION = 1;

function backupFilename() {
  const date = new Date().toISOString().slice(0, 10);
  return `travelmap-sauvegarde-${date}.zip`;
}

// Crée le fichier .zip de sauvegarde (données + photos) et renvoie son URI,
// prêt à être partagé/enregistré. Renvoie aussi quelques statistiques pour
// affichage (nombre de lieux, de photos).
export async function createBackup() {
  const places = await getPlaces();
  const homePlaceId = await getHomePlaceId();

  const zip = new JSZip();
  const photosFolder = zip.folder('photos');
  let photoCount = 0;

  const exportedPlaces = [];
  for (const place of places) {
    const exportedPhotos = [];
    for (const uri of place.photos || []) {
      if (!isStoredPhoto(uri)) continue;

      const file = new File(uri);
      if (!file.exists) continue;

      const bytes = await file.bytes();
      const filenameInZip = `${place.id}-${exportedPhotos.length}-${file.name}`;
      photosFolder.file(filenameInZip, bytes);
      exportedPhotos.push(filenameInZip);
      photoCount += 1;
    }
    exportedPlaces.push({ ...place, photos: exportedPhotos });
  }

  const data = {
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    homePlaceId,
    places: exportedPlaces,
  };
  zip.file('data.json', JSON.stringify(data, null, 2));

  const zipBytes = await zip.generateAsync({ type: 'uint8array' });

  const destination = new File(Paths.cache, backupFilename());
  if (destination.exists) destination.delete();
  destination.create();
  destination.write(zipBytes);

  return {
    uri: destination.uri,
    placesCount: exportedPlaces.length,
    photoCount,
  };
}

// Lit un fichier .zip de sauvegarde et restaure son contenu : réécrit les
// photos dans le stockage de l'app puis renvoie les lieux/domicile prêts à
// être passés à replaceAllData(). Ne modifie rien tant que cette fonction
// n'a pas fini (les données actuelles restent intactes en cas d'erreur).
export async function readBackup(fileUri) {
  const file = new File(fileUri);
  const bytes = await file.bytes();
  const zip = await JSZip.loadAsync(bytes);

  const dataEntry = zip.file('data.json');
  if (!dataEntry) {
    throw new Error("Ce fichier ne semble pas être une sauvegarde TravelMap valide.");
  }

  const data = JSON.parse(await dataEntry.async('string'));
  if (!Array.isArray(data.places)) {
    throw new Error("Ce fichier ne semble pas être une sauvegarde TravelMap valide.");
  }

  const restoredPlaces = [];
  for (const place of data.places) {
    const restoredPhotos = [];
    for (const filenameInZip of place.photos || []) {
      const entry = zip.file(`photos/${filenameInZip}`);
      if (!entry) continue;

      const bytes = await entry.async('uint8array');
      const uri = await storePhotoBytes(filenameInZip, bytes);
      restoredPhotos.push(uri);
    }
    restoredPlaces.push({ ...place, photos: restoredPhotos });
  }

  return {
    places: restoredPlaces,
    homePlaceId: data.homePlaceId || null,
  };
}
