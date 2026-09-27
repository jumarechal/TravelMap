// Calcule un score "gamifié" de progression dans un pays, qui s'adapte à sa
// superficie : dans un petit pays, quelques villes suffisent à atteindre
// 100% ; dans un grand pays, il en faut beaucoup plus.
//
// Ce n'est volontairement PAS un vrai calcul de superficie couverte (celui-ci
// resterait proche de 0% pour n'importe quel grand pays, même après l'avoir
// beaucoup parcouru) : c'est un score pensé pour rester motivant quelle que
// soit la taille du pays visité.

// Une visite dans la capitale compte comme plusieurs villes normales
const CAPITAL_WEIGHT = 3;

// Le score nécessaire pour 100% croît avec une racine douce de la
// superficie (exposant < 1) : ainsi, même un très grand pays reste
// difficile mais pas totalement hors de portée.
const SCALE_FACTOR = 0.58;
const AREA_EXPONENT = 0.35;
const MIN_REQUIRED_SCORE = 1;

// Score nécessaire pour atteindre 100% dans un pays de cette superficie
function requiredScoreForArea(areaKm2) {
  if (!areaKm2 || areaKm2 <= 0) return MIN_REQUIRED_SCORE;
  return Math.max(SCALE_FACTOR * areaKm2 ** AREA_EXPONENT, MIN_REQUIRED_SCORE);
}

// places : les lieux enregistrés dans ce pays (avec leur ville)
// areaKm2 : superficie approximative du pays
// capitalCity : nom de la capitale "pratique" du pays (pour le bonus)
export function computeCoveragePercent(places, areaKm2, capitalCity) {
  if (!places || places.length === 0) return 0;

  const distinctCities = new Set(places.map((p) => p.city).filter(Boolean));
  if (distinctCities.size === 0) return 0;

  let score = 0;
  distinctCities.forEach((city) => {
    const isCapital = capitalCity && city.toLowerCase() === capitalCity.toLowerCase();
    score += isCapital ? CAPITAL_WEIGHT : 1;
  });

  const requiredScore = requiredScoreForArea(areaKm2);
  return Math.min((score / requiredScore) * 100, 100);
}
