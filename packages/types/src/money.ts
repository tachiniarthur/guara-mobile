declare const centsBrand: unique symbol;

/**
 * Monetary amount in **integer cents**. Never use floats for money.
 * Create values through `cents()` from `@guara/utils` so the brand is enforced.
 */
export type Cents = number & { readonly [centsBrand]: 'Cents' };

/** ISO-4217 currency codes supported by the app. */
export type Currency = 'BRL' | 'USD' | 'EUR';

export interface Money {
  amount: Cents;
  currency: Currency;
}
