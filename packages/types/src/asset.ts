import type { ISODateTime } from './common';
import type { Cents, Currency } from './money';

export type AssetType = 'stock' | 'fii' | 'etf' | 'bdr' | 'crypto' | 'fund' | 'fixed_income';

/** Market asset quoted via Brapi (always fetched through our API). */
export interface Asset {
  ticker: string;
  name: string;
  type: AssetType;
  currency: Currency;
  logoUrl: string | null;
  /** ISO-3166 alpha-2 country code used for exposure analysis. */
  country: string | null;
  lastPrice: Cents | null;
  /** Day change in percent (e.g. 1.25 = +1,25%). */
  dayChangePercent: number | null;
  quotedAt: ISODateTime | null;
}
