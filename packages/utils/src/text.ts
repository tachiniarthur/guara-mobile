/**
 * Search key of a text: no accents, lower case (pt-BR) and trimmed, so "Pátria" matches
 * "patria". Compare with `includes` on both sides normalized.
 */
export function normalizeForSearch(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('pt-BR').trim();
}

/** pt-BR list: "Nubank", "Nubank e Itaú", "Nubank, Itaú e Inter". */
export function joinList(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;
}
