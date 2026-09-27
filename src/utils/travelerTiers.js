// Paliers du profil "Voyageur" : plus on connaît de pays (et plus on les
// connaît bien), plus le profil évolue. L'XP d'un pays est simplement son
// niveau (1 à 6) ; l'XP totale est la somme sur tous les pays visités.
export const TRAVELER_TIERS = [
  { minXp: 0, name: 'Sédentaire', icon: '🏠' },
  { minXp: 5, name: 'Curieux', icon: '🎒' },
  { minXp: 10, name: 'Voyageur', icon: '✈️' },
  { minXp: 20, name: 'Globe-trotteur', icon: '🧭' },
  { minXp: 35, name: 'Aventurier', icon: '🗺️' },
  { minXp: 55, name: 'Grand voyageur', icon: '🌍' },
  { minXp: 80, name: 'Explorateur légendaire', icon: '🏆' },
  { minXp: 120, name: 'Maître du monde', icon: '👑' },
  { minXp: 160, name: 'Globe-conquérant', icon: '🌐' },
  { minXp: 210, name: 'Légende vivante', icon: '🐉' },
  { minXp: 270, name: 'Icône du voyage', icon: '⚡' },
  { minXp: 340, name: 'Mythe des voyageurs', icon: '🔥' },
  { minXp: 420, name: 'Divinité du globe', icon: '🌌' },
  { minXp: 520, name: 'Voyageur infini', icon: '♾️' },
];

// Calcule l'XP totale du profil à partir des stats de chaque pays visité
export function computeTravelerXp(statsByCode) {
  return Object.values(statsByCode).reduce((sum, stats) => sum + (stats.level || 0), 0);
}

// Index du palier actuel (le plus haut palier dont le seuil est atteint)
export function getTravelerTierIndex(xp) {
  let index = 0;
  for (let i = 0; i < TRAVELER_TIERS.length; i++) {
    if (xp >= TRAVELER_TIERS[i].minXp) index = i;
  }
  return index;
}
