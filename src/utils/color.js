// Convertit une couleur hexadécimale (#rrggbb) en rgba(...) avec une opacité,
// pratique pour dessiner des zones semi-transparentes sur la carte.
export function hexToRgba(hexColor, alpha) {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
