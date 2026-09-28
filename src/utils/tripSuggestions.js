import { COUNTRIES, CONTINENTS } from '../data/countries';

const MAX_PER_SECTION = 6;
const EARTH_RADIUS_KM = 6371;

// Mélange un tableau (copie) pour varier les suggestions à chaque tirage
function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

// Distance à vol d'oiseau (km) entre deux points, formule de haversine
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const a = sinDLat * sinDLat + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * sinDLon * sinDLon;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Propose des destinations à partir des pays déjà visités, sans IA :
// - "nearby" : pays non visités les plus proches de chez toi (si un
//   domicile principal est défini), pour des escapades plus courtes
// - "familiar" : pays non visités du continent où l'on a le plus voyagé
// - "discovery" : pays d'un continent pas encore exploré du tout (ou, à
//   défaut, du continent le moins connu) pour changer d'horizon
export function getSuggestedDestinations(visitedCountryCodes, homeCoords) {
  const visitedSet = new Set(visitedCountryCodes);
  const unvisited = COUNTRIES.filter((c) => !visitedSet.has(c.code));

  const hasHome =
    homeCoords && Number.isFinite(homeCoords.latitude) && Number.isFinite(homeCoords.longitude);

  const withDistance = (country) =>
    hasHome
      ? {
          ...country,
          distanceKm: Math.round(
            haversineDistanceKm(
              homeCoords.latitude,
              homeCoords.longitude,
              country.capitalLat,
              country.capitalLng
            )
          ),
        }
      : country;

  const nearby = hasHome
    ? unvisited
        .map(withDistance)
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, MAX_PER_SECTION)
    : [];

  if (visitedSet.size === 0) {
    return {
      mainContinent: null,
      nearby,
      familiar: [],
      discovery: shuffle(unvisited).slice(0, MAX_PER_SECTION).map(withDistance),
    };
  }

  const continentCounts = {};
  CONTINENTS.forEach((continent) => {
    continentCounts[continent] = 0;
  });
  COUNTRIES.forEach((c) => {
    if (visitedSet.has(c.code)) continentCounts[c.continent] += 1;
  });

  const mainContinent = CONTINENTS.reduce(
    (best, continent) => (continentCounts[continent] > continentCounts[best] ? continent : best),
    CONTINENTS[0]
  );

  const familiarPool = unvisited.filter((c) => c.continent === mainContinent);
  const unexploredContinents = unvisited.filter((c) => continentCounts[c.continent] === 0);
  const discoveryPool =
    unexploredContinents.length > 0
      ? unexploredContinents
      : unvisited.filter((c) => c.continent !== mainContinent);

  return {
    mainContinent,
    nearby,
    familiar: shuffle(familiarPool).slice(0, MAX_PER_SECTION).map(withDistance),
    discovery: shuffle(discoveryPool).slice(0, MAX_PER_SECTION).map(withDistance),
  };
}
