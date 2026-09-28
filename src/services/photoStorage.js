import { File, Directory, Paths } from 'expo-file-system';

// Dossier privé de l'app où sont copiées les photos ajoutées à un lieu,
// pour qu'elles restent disponibles même si le fichier d'origine (galerie,
// cache de l'appareil photo) est supprimé ou déplacé.
const PHOTOS_DIR = new Directory(Paths.document, 'photos');

function ensurePhotosDir() {
  if (!PHOTOS_DIR.exists) {
    PHOTOS_DIR.create();
  }
}

// Une photo est "déjà stockée" par l'app si son chemin est dans ce dossier
// (par opposition à une photo qui vient d'être choisie et vit encore dans
// un dossier temporaire de la galerie/caméra)
export function isStoredPhoto(uri) {
  return typeof uri === 'string' && uri.startsWith(PHOTOS_DIR.uri);
}

// Génère un nom de fichier unique dans le dossier des photos, en conservant
// l'extension d'origine (utile pour distinguer les formats, même si elle
// n'est pas strictement nécessaire au fonctionnement de l'app)
function uniquePhotoFilename(nameOrUri) {
  const extension = nameOrUri.split('.').pop().split('?')[0] || 'jpg';
  return `${Date.now()}-${Math.round(Math.random() * 1e6)}.${extension}`;
}

// Copie une photo choisie (galerie ou appareil photo) dans le stockage de
// l'app, et renvoie son nouveau chemin permanent
export async function storePhoto(sourceUri) {
  ensurePhotosDir();
  const filename = uniquePhotoFilename(sourceUri);

  const sourceFile = new File(sourceUri);
  const destFile = new File(PHOTOS_DIR, filename);
  await sourceFile.copy(destFile);
  return destFile.uri;
}

// Écrit directement des octets (ex: extraits d'une sauvegarde importée)
// comme nouvelle photo dans le stockage de l'app, et renvoie son chemin
export async function storePhotoBytes(originalFilename, bytes) {
  ensurePhotosDir();
  const filename = uniquePhotoFilename(originalFilename);

  const destFile = new File(PHOTOS_DIR, filename);
  destFile.create();
  destFile.write(bytes);
  return destFile.uri;
}

// Supprime une photo stockée par l'app (ne fait rien si ce n'est pas une
// photo gérée par l'app, ou si le fichier n'existe déjà plus)
export async function deleteStoredPhoto(uri) {
  if (!isStoredPhoto(uri)) return;
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la photo :', error);
  }
}
