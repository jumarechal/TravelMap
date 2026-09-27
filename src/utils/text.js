// Normalise un texte pour la recherche : minuscules et sans accents,
// pour que "hanoi" trouve aussi "Hanoï"
export function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}
