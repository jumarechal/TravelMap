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

// Copie une photo choisie (galerie ou appareil photo) dans le stockage de
// l'app, et renvoie son nouveau chemin permanent
export async function storePhoto(sourceUri) {
  ensurePhotosDir();
  const extension = sourceUri.split('.').pop().split('?')[0] || 'jpg';
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${extension}`;

  const sourceFile = new File(sourceUri);
  const destFile = new File(PHOTOS_DIR, filename);
  await sourceFile.copy(destFile);
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
