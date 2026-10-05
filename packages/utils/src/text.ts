/**
 * Search key of a text: no accents, lower case (pt-BR) and trimmed, so "Pátria" matches
 * "patria". Compare with `includes` on both sides normalized.
 */
export function normalizeForSearch(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('pt-BR').trim();
}
