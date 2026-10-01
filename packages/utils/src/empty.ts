/** Placeholder shown whenever a value is missing. Never invent values. */
export const EMPTY = '—';

/** True for `null`, `undefined`, empty/blank strings and `NaN`. */
export function isEmptyValue(value: unknown): value is null | undefined {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value === 'number') return Number.isNaN(value);
  return false;
}

/**
 * Returns the formatted value, or "—" when it is missing.
 *
 * @example orEmpty(user.name) // "Ana" | "—"
 * @example orEmpty(balance, formatCents) // "R$ 10,00" | "—"
 */
export function orEmpty<T>(value: T | null | undefined, format?: (value: T) => string): string {
  if (isEmptyValue(value)) return EMPTY;
  return format ? format(value as T) : String(value);
}
