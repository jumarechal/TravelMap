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
