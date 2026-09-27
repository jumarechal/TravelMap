import { usePlaces } from '../context/PlacesContext';

// Les statistiques par pays (niveau, couverture, etc.) sont calculées une
// seule fois dans PlacesContext (et mises en cache par pays) pour éviter que
// chaque écran (Carte, Passeport) ne refasse le même calcul coûteux.
export function useCountryStats() {
  return usePlaces().countryStats;
}
