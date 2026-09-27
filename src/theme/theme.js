// Thème visuel centralisé de l'app : couleurs, espacements, arrondis, ombres.
// Toutes les couleurs et styles répétés dans l'app passent par ce fichier,
// pour garder un look cohérent partout et pouvoir tout ajuster en un endroit.

export const colors = {
  // Couleur principale : les lieux exacts où l'on a dormi (marker, cercle, liens)
  primary: '#4C5FE0',
  primaryDark: '#3646B8',
  primarySoft: '#E8EAFC',

  // Couleur d'accent : tout ce qui représente un pays "débloqué"
  accent: '#FF8B5E',
  accentDark: '#E96F3F',
  accentSoft: '#FFEADE',

  background: '#F6F7FB',
  surface: '#FFFFFF',
  border: '#E7E9F2',

  text: '#1D2030',
  textMuted: '#7A7F92',

  danger: '#F14C4C',
  dangerSoft: '#FDEBEB',

  locked: '#EEF0F5',
  lockedBorder: '#E1E4EC',
  lockedText: '#B7BBC8',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };

// Échelle de couleurs pour les niveaux de connaissance d'un pays (1 à 6),
// du plus clair (niveau 1) au plus foncé (niveau 6). Utilisée sur les badges
// du Passeport (fonds pleins, donc un simple dégradé clair -> foncé suffit
// et reste lisible).
export const levelColors = {
  1: '#FFEBD9',
  2: '#FFD1AC',
  3: '#FFB37D',
  4: '#FA8F4E',
  5: '#E86A2E',
  6: '#A83E12',
};

export function getLevelColor(level) {
  return levelColors[level] || colors.locked;
}

// Texte sombre sur les niveaux clairs, texte blanc sur les niveaux foncés
export function getLevelTextColor(level) {
  return level >= 4 ? '#FFFFFF' : colors.text;
}

// Palette dédiée à la Carte : sur un fond de carte, un simple dégradé clair
// -> foncé d'une seule teinte devient vite trop pâle pour être joli. On
// utilise donc une teinte différente par niveau (plutôt qu'un simple
// contraste), pensée comme une progression douce du débutant à l'expert,
// jusqu'à un ton presque noir pour le niveau maximal.
export const mapLevelColors = {
  1: '#F2CB61', // jaune doux
  2: '#F0A354', // orange doux
  3: '#E2685F', // rouge corail doux
  4: '#CE6A93', // rose / magenta doux
  5: '#9B7ED8', // violet doux
  6: '#D4A017', // or
};

export function getMapLevelColor(level) {
  return mapLevelColors[level] || colors.locked;
}

export const shadow = {
  card: {
    shadowColor: '#1D2030',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  floating: {
    shadowColor: '#1D2030',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
};
