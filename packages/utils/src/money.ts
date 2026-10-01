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

const COMPACT_UNITS = [
  { suffix: 'mil', cents: 100_000 }, // R$ 1 mil
  { suffix: 'mi', cents: 100_000_000 }, // R$ 1 milhão
  { suffix: 'bi', cents: 100_000_000_000 }, // R$ 1 bilhão
  { suffix: 'tri', cents: 100_000_000_000_000 }, // R$ 1 trilhão
] as const;

/**
 * Short pt-BR format for large amounts, with one decimal: "R$ 1,2 mil", "R$ 3,4 mi".
 * Below R$ 1.000 it falls back to `formatCents`. Rounds half away from zero.
 * Missing or invalid values render as "—".
 */
export function formatCentsCompact(
  value: Cents | number | null | undefined,
  { currency = 'BRL', signDisplay = 'auto' }: Omit<FormatCentsOptions, 'hideSymbol'> = {},
): string {
  if (value === null || value === undefined || !Number.isSafeInteger(value)) return EMPTY;

  const abs = Math.abs(value);
  const first = COMPACT_UNITS[0];
  if (abs < first.cents) return formatCents(value, { currency, signDisplay });

  let unitIndex = COMPACT_UNITS.findLastIndex((unit) => abs >= unit.cents);
  let tenths = Math.round(abs / (COMPACT_UNITS[unitIndex]!.cents / 10));
  // 999,95 mil rounds to 1.000,0 mil → promote to "1 mi".
  if (tenths >= 10_000 && unitIndex < COMPACT_UNITS.length - 1) {
    unitIndex += 1;
    tenths = Math.round(abs / (COMPACT_UNITS[unitIndex]!.cents / 10));
  }

  const integerPart = groupThousands(String(Math.trunc(tenths / 10)));
  const decimal = tenths % 10;
  const number = decimal ? `${integerPart},${decimal}` : integerPart;
  const body = `${CURRENCY_SYMBOL[currency]}${NBSP}${number}${NBSP}${COMPACT_UNITS[unitIndex]!.suffix}`;

  let sign = '';
  if (signDisplay !== 'never') {
    if (value < 0) sign = '-';
    else if (value > 0 && signDisplay === 'always') sign = '+';
  }
  return `${sign}${body}`;
}

const SPOKEN_CURRENCY: Record<Currency, [singular: string, plural: string]> = {
  BRL: ['real', 'reais'],
  USD: ['dólar', 'dólares'],
  EUR: ['euro', 'euros'],
};

/** Accessible label read by screen readers when a value is missing. */
export const EMPTY_SPOKEN = 'sem informação';

/**
 * Text for screen readers: 123456 → "1.234 reais e 56 centavos", -150 → "menos 1 real e
 * 50 centavos". Avoids readers spelling out "R cifrão" and the decimal comma.
 */
export function formatCentsForSpeech(
  value: Cents | number | null | undefined,
  currency: Currency = 'BRL',
): string {
  if (value === null || value === undefined || !Number.isSafeInteger(value)) return EMPTY_SPOKEN;

  const abs = Math.abs(value);
  const units = Math.trunc(abs / 100);
  const fraction = abs % 100;
  const [singular, plural] = SPOKEN_CURRENCY[currency];

  const parts: string[] = [];
  if (units > 0 || fraction === 0) {
    parts.push(`${groupThousands(String(units))} ${units === 1 ? singular : plural}`);
  }
  if (fraction > 0) parts.push(`${fraction} ${fraction === 1 ? 'centavo' : 'centavos'}`);

  return `${value < 0 ? 'menos ' : ''}${parts.join(' e ')}`;
}
