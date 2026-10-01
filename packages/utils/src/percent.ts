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
