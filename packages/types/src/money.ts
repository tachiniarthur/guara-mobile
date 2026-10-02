/**
 * Money convention: **integer cents** (`Cents`), always — never floats, never `number`
 * loose. Create values with `cents()`, add with `sumCents()`/`addCents()`, split
 * installments with `splitCents()` and format with `formatCents()` (all in `@guara/utils`).
 *
 * - Balances and deltas may be negative (`CentsSchema`).
 * - Transaction amounts are always positive (`PositiveCentsSchema`); the sign comes from
 *   `direction: 'in' | 'out'`.
 * - The only exception is per-unit market values below one cent (e.g. dividends per share),
 *   which use `DecimalString` in reais and say so in their TSDoc.
 */
import { z } from 'zod';

export const CentsSchema = z.int().brand<'Cents'>();
/** Monetary amount in integer cents (branded). */
export type Cents = z.infer<typeof CentsSchema>;

export const PositiveCentsSchema = z.int().positive().brand<'Cents'>();
export const NonNegativeCentsSchema = z.int().nonnegative().brand<'Cents'>();

/** ISO 4217 currency codes supported by the app. */
export const CurrencySchema = z.enum(['BRL', 'USD', 'EUR']);
export type Currency = z.infer<typeof CurrencySchema>;

export const MoneySchema = z.object({ amount: CentsSchema, currency: CurrencySchema });
export type Money = z.infer<typeof MoneySchema>;
