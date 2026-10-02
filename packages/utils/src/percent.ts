import type { Cents } from '@guara/types';

import { EMPTY } from './empty';

export interface FormatPercentOptions {
  fractionDigits?: number;
  /** `always` adds "+" to positive values (useful for variations). */
  signDisplay?: 'auto' | 'always';
}

/**
 * Formats a percentage number in pt-BR: 12.345 → "12,35%".
 * The input is already in percent (12.5 means 12,5%), not a ratio.
 */
export function formatPercent(
  value: number | null | undefined,
  { fractionDigits = 2, signDisplay = 'auto' }: FormatPercentOptions = {},
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return EMPTY;

  const fixed = Math.abs(value).toFixed(fractionDigits);
  const isZero = Number(fixed) === 0;
  const [integerPart = '0', fractionPart] = fixed.split('.');
  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const number = fractionPart ? `${grouped},${fractionPart}` : grouped;

  let sign = '';
  if (!isZero && value < 0) sign = '-';
  else if (!isZero && signDisplay === 'always') sign = '+';

  return `${sign}${number}%`;
}

/** 0.125 → 12.5 */
export function ratioToPercent(ratio: number): number {
  return ratio * 100;
}

/** Percentage change between two amounts, or `null` when the base is zero. */
export function percentChange(from: Cents, to: Cents): number | null {
  if (from === 0) return null;
  return ((to - from) / Math.abs(from)) * 100;
}

/** Screen-reader text: 12.5 → "12,50 por cento", -3 → "menos 3,00 por cento". */
export function formatPercentForSpeech(
  value: number | null | undefined,
  options?: FormatPercentOptions,
): string {
  const text = formatPercent(value, options);
  if (text === EMPTY) return 'sem informação';
  return text.replace(/^-/, 'menos ').replace(/^\+/, 'mais ').replace(/%$/, ' por cento');
}

/**
 * Share of each amount in the total, in percent with `decimals` places, adjusted with the
 * largest-remainder method so the result sums to exactly 100 (e.g. portfolio slices).
 * Returns zeros when the total is zero.
 *
 * @example sharesOf([cents(1), cents(1), cents(1)]) // [33.34, 33.33, 33.33]
 */
export function sharesOf(values: readonly Cents[], decimals = 2): number[] {
  if (values.some((value) => value < 0)) throw new RangeError('Values must not be negative');
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total === 0) return values.map(() => 0);

  const scale = 10 ** decimals;
  const units = 100 * scale;
  const exact = values.map((value) => (value * units) / total);
  const floors = exact.map(Math.floor);
  let missing = units - floors.reduce((sum, value) => sum + value, 0);
  const order = exact
    .map((value, index) => ({ index, remainder: value - floors[index]! }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  for (const { index } of order) {
    if (missing <= 0) break;
    floors[index]! += 1;
    missing -= 1;
  }
  return floors.map((value) => value / scale);
}
