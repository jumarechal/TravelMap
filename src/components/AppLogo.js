import React from 'react';
import Svg, { Rect, Circle, Path } from 'react-native-svg';

// Couleurs fixes du logo ("Anchor Point"), indépendantes du thème de l'app :
// ce sont les mêmes couleurs que celles utilisées pour générer l'icône de
// l'app (assets/icon.png), donc elles ne doivent pas suivre les changements
// de thème (bouton, accents, etc.).
const LOGO_BG = '#12192B';
const LOGO_RING = '#EF7860';
const LOGO_PIN = '#E8B34C';

// Logo de l'app ("Anchor Point") : pin doré entouré d'un cercle en
// pointillés corail (la "zone de connaissance"), sur fond bleu nuit.
// Reprend exactement le tracé utilisé pour l'icône de l'app.
export default function AppLogo({ size = 120, rounded = true }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width={100} height={100} rx={rounded ? 22 : 0} fill={LOGO_BG} />
      <Circle
        cx={50}
        cy={52}
        r={34}
        fill="none"
        stroke={LOGO_RING}
        strokeWidth={3}
        strokeDasharray="3 7"
        strokeLinecap="round"
      />
      <Path
        d="M50 18c-12.7 0-23 10.1-23 22.6C27 58 50 82 50 82s23-24 23-41.4C73 28.1 62.7 18 50 18z"
        fill={LOGO_PIN}
      />
      <Circle cx={50} cy={41} r={9} fill={LOGO_BG} />
    </Svg>
  );
}
