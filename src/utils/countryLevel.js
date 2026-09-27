// Détermine le niveau de connaissance (0 à 6) d'un pays, à partir de
// plusieurs façons de "connaître" un pays : le niveau retenu est le plus
// élevé parmi tous les critères atteints (villes visitées OU score de
// progression, adapté à la taille du pays).
//
// 0 - jamais visité
// 1 - visité au moins une fois
// 2 - au moins 2 villes différentes visitées
// 3 - au moins 5 villes différentes, ou plus de 25% de progression
// 4 - au moins 8 villes différentes, ou plus de 50% de progression
// 5 - au moins 12 villes différentes, ou plus de 75% de progression
// 6 - 90% de progression ou plus : voyageur légende du pays
export function getCountryLevel({ placesCount, cityCount, coveragePercent }) {
  if (coveragePercent >= 90) return 6;
  if (cityCount >= 12 || coveragePercent > 75) return 5;
  if (cityCount >= 8 || coveragePercent > 50) return 4;
  if (cityCount >= 5 || coveragePercent > 25) return 3;
  if (cityCount >= 2) return 2;
  if (placesCount >= 1) return 1;
  return 0;
}

export const LEVEL_LABELS = {
  0: 'Jamais visité',
  1: 'Visité',
  2: 'Exploré',
  3: 'Bien connu',
  4: 'Grand connaisseur',
  5: 'Expert du pays',
  6: 'Légende du pays',
};
