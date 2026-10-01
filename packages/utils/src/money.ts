import type { Cents, Currency } from '@guara/types';

import { EMPTY } from './empty';

/** Non-breaking space, the same separator `Intl.NumberFormat('pt-BR')` uses after "R$". */
export const NBSP = '\u00A0';

const CURRENCY_SYMBOL: Record<Currency, string> = {
  BRL: 'R$',
  USD: 'US$',
  EUR: '€',
};

/** Creates a `Cents` value, throwing if it is not a safe integer. */
export function cents(value: number): Cents {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(
      `Invalid cents value: ${value}. Money must be an integer number of cents.`,
    );
  }
  return value as Cents;
}

export function isCents(value: unknown): value is Cents {
  return typeof value === 'number' && Number.isSafeInteger(value);
}

export const ZERO_CENTS: Cents = cents(0);

/** Integer-safe sum. Throws if the result overflows `Number.MAX_SAFE_INTEGER`. */
export function sumCents(values: readonly Cents[]): Cents {
  let total = 0;
  for (const value of values) total += cents(value);
  return cents(total);
}

export function addCents(...values: Cents[]): Cents {
  return sumCents(values);
}

export function subtractCents(a: Cents, b: Cents): Cents {
  return cents(cents(a) - cents(b));
}

export function negateCents(value: Cents): Cents {
  return cents(value === 0 ? 0 : -value);
}

export function absCents(value: Cents): Cents {
  return cents(Math.abs(value));
}

/** Rounds half away from zero (commercial rounding): 0.5 → 1, -0.5 → -1. */
function roundHalfAwayFromZero(value: number): number {
  const rounded = Math.sign(value) * Math.round(Math.abs(value));
  return rounded === 0 ? 0 : rounded;
}

/**
 * Multiplies an amount by a factor (e.g. a rate) and rounds to whole cents.
 * Use for percentages/rates only; never to convert reais to cents.
 */
export function multiplyCents(value: Cents, factor: number): Cents {
  if (!Number.isFinite(factor)) throw new RangeError(`Invalid factor: ${factor}`);
  return cents(roundHalfAwayFromZero(cents(value) * factor));
}

/**
 * Splits an amount into `parts` integer installments whose sum equals the total.
 * The leftover cents go to the first installments: 1000 / 3 → [334, 333, 333].
 */
export function splitCents(total: Cents, parts: number): Cents[] {
  if (!Number.isSafeInteger(parts) || parts <= 0) {
    throw new RangeError(`Invalid number of parts: ${parts}`);
  }
  const sign = total < 0 ? -1 : 1;
  const abs = Math.abs(cents(total));
  const base = Math.floor(abs / parts);
  const remainder = abs % parts;
  return Array.from({ length: parts }, (_, index) =>
    cents(sign * (base + (index < remainder ? 1 : 0)) || 0),
  );
}

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export interface FormatCentsOptions {
  currency?: Currency;
  /** `auto`: "-" only for negatives. `always`: also "+" for positives. `never`: no sign. */
  signDisplay?: 'auto' | 'always' | 'never';
  /** Omit the currency symbol ("1.234,56"). */
  hideSymbol?: boolean;
}

/**
 * Formats integer cents as pt-BR currency using integer math only.
 * Missing or invalid values render as "—".
 *
 * @example formatCents(123456) // "R$ 1.234,56" (with a non-breaking space)
 */
export function formatCents(
  value: Cents | number | null | undefined,
  { currency = 'BRL', signDisplay = 'auto', hideSymbol = false }: FormatCentsOptions = {},
): string {
  if (value === null || value === undefined || !Number.isSafeInteger(value)) return EMPTY;

  const abs = Math.abs(value);
  const integerPart = groupThousands(String(Math.trunc(abs / 100)));
  const fractionPart = String(abs % 100).padStart(2, '0');
  const number = `${integerPart},${fractionPart}`;
  const body = hideSymbol ? number : `${CURRENCY_SYMBOL[currency]}${NBSP}${number}`;

  let sign = '';
  if (signDisplay !== 'never') {
    if (value < 0) sign = '-';
    else if (value > 0 && signDisplay === 'always') sign = '+';
  }
  return `${sign}${body}`;
}

const STRICT_PT_BR_NUMBER = /^(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?$/;

/**
 * Parses a pt-BR money string into integer cents. Returns `null` when invalid.
 * Accepts "R$ 1.234,56", "1234,56", "1.234", "-12,5", "0,99".
 * Dots are thousand separators and the comma is the decimal separator;
 * more than two decimal places is rejected (never silently rounded).
 */
export function parseToCents(input: string | null | undefined): Cents | null {
  if (input == null) return null;

  // `\s` also matches the non-breaking space produced by formatCents().
  let text = input.replace(/\s/g, '').replace(/^(R\$|US\$|€)/, '');
  let sign = 1;
  if (text.startsWith('-') || text.startsWith('+')) {
    if (text.startsWith('-')) sign = -1;
    text = text.slice(1).replace(/^(R\$|US\$|€)/, '');
  }

  const match = STRICT_PT_BR_NUMBER.exec(text);
  if (!match) return null;

  const integerDigits = (match[1] ?? '0').replace(/\./g, '');
  const fractionDigits = (match[2] ?? '').padEnd(2, '0');
  const value = Number(integerDigits) * 100 + Number(fractionDigits);
  if (!Number.isSafeInteger(value)) return null;

  return cents(sign * value || 0);
}
