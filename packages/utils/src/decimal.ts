/**
 * Exact arithmetic on decimal strings (`DecimalString`: "200", "0.00314"), used for
 * fractional quantities (fund quotas, crypto) and sub-cent per-unit values. Everything runs
 * on BigInt — never on floats — and results in money are rounded half away from zero.
 */
import type { Cents, DecimalString } from '@guara/types';

import { cents } from './money';

const DECIMAL = /^(0|[1-9]\d*)(\.\d+)?$/;

interface ScaledDecimal {
  /** Digits without the point: "12.345" → 12345n. */
  units: bigint;
  /** Number of decimal places: "12.345" → 3. */
  scale: number;
}

export function isDecimalString(value: unknown): value is DecimalString {
  return typeof value === 'string' && DECIMAL.test(value);
}

function parseDecimal(value: string): ScaledDecimal {
  if (!DECIMAL.test(value)) throw new RangeError(`Invalid decimal string: "${value}"`);
  const [integer = '0', fraction = ''] = value.split('.');
  return { units: BigInt(integer + fraction), scale: fraction.length };
}

/** Formats scaled units back into a canonical decimal string (no trailing zeros). */
function formatScaled(units: bigint, scale: number): DecimalString {
  const digits = units.toString().padStart(scale + 1, '0');
  const integer = digits.slice(0, digits.length - scale);
  const fraction = digits.slice(digits.length - scale).replace(/0+$/, '');
  return (fraction ? `${integer}.${fraction}` : integer) as DecimalString;
}

/** Divides by 10^scale rounding half away from zero (inputs here are never negative). */
function roundScaled(units: bigint, scale: number): bigint {
  if (scale === 0) return units;
  const divisor = 10n ** BigInt(scale);
  const quotient = units / divisor;
  return (units % divisor) * 2n >= divisor ? quotient + 1n : quotient;
}

function toCents(value: bigint): Cents {
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new RangeError('Amount exceeds the safe integer range');
  }
  return cents(Number(value));
}

/** Sum of decimal strings, exact: addDecimals("0.1", "0.2") → "0.3". */
export function addDecimals(...values: string[]): DecimalString {
  const parsed = values.map(parseDecimal);
  const scale = Math.max(0, ...parsed.map((value) => value.scale));
  const total = parsed.reduce(
    (sum, value) => sum + value.units * 10n ** BigInt(scale - value.scale),
    0n,
  );
  return formatScaled(total, scale);
}

/**
 * Unit price in cents × quantity, rounded to whole cents.
 * @example multiplyCentsByDecimal(cents(3842), "200") // 768400 (R$ 7.684,00)
 */
export function multiplyCentsByDecimal(unitPrice: Cents, quantity: string): Cents {
  if (unitPrice < 0) throw new RangeError('Unit price must not be negative');
  const { units, scale } = parseDecimal(quantity);
  return toCents(roundScaled(BigInt(unitPrice) * units, scale));
}

/**
 * Per-unit value in **reais** (decimal string) × quantity, in whole cents. Used for
 * dividends per share, which often have sub-cent precision.
 * @example multiplyReaisByDecimal("0.452318", "300") // 13570 (R$ 135,70)
 */
export function multiplyReaisByDecimal(reaisPerUnit: string, quantity: string): Cents {
  const price = parseDecimal(reaisPerUnit);
  const amount = parseDecimal(quantity);
  // reais → cents adds two decimal places.
  return toCents(roundScaled(price.units * amount.units * 100n, price.scale + amount.scale));
}

/**
 * Total in cents ÷ quantity, rounded to whole cents — e.g. the average price of a position.
 * Throws when the quantity is zero.
 * @example divideCentsByDecimal(cents(621000), "200") // 3105 (R$ 31,05)
 */
export function divideCentsByDecimal(total: Cents, quantity: string): Cents {
  if (total < 0) throw new RangeError('Total must not be negative');
  const { units, scale } = parseDecimal(quantity);
  if (units === 0n) throw new RangeError('Quantity must not be zero');
  const numerator = BigInt(total) * 10n ** BigInt(scale);
  const quotient = numerator / units;
  return toCents((numerator % units) * 2n >= units ? quotient + 1n : quotient);
}
