/** Market data quoted via Brapi — always fetched through our API. */
import { z } from 'zod';

import { DecimalStringSchema, IsoDateSchema, IsoDateTimeSchema } from './common';
import { PositionIdSchema, TickerSchema } from './ids';
import { CentsSchema, CurrencySchema, NonNegativeCentsSchema, PositiveCentsSchema } from './money';
import { PercentSchema } from './percent';

export const AssetTypeSchema = z.enum(['stock', 'fii', 'etf', 'bdr', 'crypto', 'index']);
export type AssetType = z.infer<typeof AssetTypeSchema>;

/**
 * Quote. Priced assets use `price`/`yearLow`/`yearHigh` in cents; indexes (`type: 'index'`)
 * have no price and report `points` instead.
 */
export const AssetSchema = z.object({
  ticker: TickerSchema,
  name: z.string().min(1),
  type: AssetTypeSchema,
  currency: CurrencySchema,
  logoUrl: z.url().nullable(),
  price: NonNegativeCentsSchema.nullable(),
  /** Indexes only, e.g. "131245.67". */
  points: DecimalStringSchema.nullable(),
  dayChangePercent: PercentSchema.nullable(),
  yearLow: NonNegativeCentsSchema.nullable(),
  yearHigh: NonNegativeCentsSchema.nullable(),
  quotedAt: IsoDateTimeSchema.nullable(),
});
export type Asset = z.infer<typeof AssetSchema>;

export const AssetSearchQuerySchema = z.object({
  q: z.string().min(1).max(40),
  type: AssetTypeSchema.optional(),
});
export type AssetSearchQuery = z.infer<typeof AssetSearchQuerySchema>;

export const PriceRangeSchema = z.enum(['1m', '6m', '1y', '5y']);
export type PriceRange = z.infer<typeof PriceRangeSchema>;

export const PricePointSchema = z.object({
  date: IsoDateSchema,
  /** Closing price (priced assets). */
  close: NonNegativeCentsSchema.nullable(),
  /** Closing points (indexes). */
  points: DecimalStringSchema.nullable(),
});
export type PricePoint = z.infer<typeof PricePointSchema>;

export const PriceHistorySchema = z.object({
  ticker: TickerSchema,
  range: PriceRangeSchema,
  points: z.array(PricePointSchema),
});
export type PriceHistory = z.infer<typeof PriceHistorySchema>;

export const IndicatorWindowSchema = z.enum(['1m', '6m', '12m', '60m']);
export type IndicatorWindow = z.infer<typeof IndicatorWindowSchema>;

export const AssetIndicatorsSchema = z.object({
  window: IndicatorWindowSchema,
  return: PercentSchema.nullable(),
  /** CDI over the same window, for comparison. */
  cdi: PercentSchema.nullable(),
  /** Annualised volatility. */
  volatility: PercentSchema.nullable(),
  /** Sharpe ratio against the CDI (a plain ratio, not a percent). */
  sharpe: z.number().nullable(),
});
export type AssetIndicators = z.infer<typeof AssetIndicatorsSchema>;

/** Latest quarterly results. Company-wide amounts in cents. */
export const EarningsReportSchema = z.object({
  /** Fiscal period label, e.g. "2T26". */
  period: z.string().min(1),
  publishedOn: IsoDateSchema,
  revenue: CentsSchema.nullable(),
  netIncome: CentsSchema.nullable(),
  ebitda: CentsSchema.nullable(),
  netMargin: PercentSchema.nullable(),
  roe: PercentSchema.nullable(),
});
export type EarningsReport = z.infer<typeof EarningsReportSchema>;

/** `jcp` = juros sobre capital próprio; `income` = FII monthly distribution. */
export const DividendTypeSchema = z.enum(['dividend', 'jcp', 'income']);
export type DividendType = z.infer<typeof DividendTypeSchema>;

export const DividendSchema = z.object({
  type: DividendTypeSchema,
  exDate: IsoDateSchema,
  paymentDate: IsoDateSchema.nullable(),
  /**
   * Amount per unit **in reais** as a decimal string ("0.452318"): per-share values often
   * have sub-cent precision. Multiply by the quantity with the decimal helpers of
   * `@guara/utils` to get cents.
   */
  amountPerUnit: DecimalStringSchema,
});
export type Dividend = z.infer<typeof DividendSchema>;

export const CorporateEventSchema = z.object({
  type: z.enum(['split', 'reverse_split', 'bonus', 'subscription', 'other']),
  date: IsoDateSchema,
  /** pt-BR text from the API. */
  description: z.string().min(1),
});
export type CorporateEvent = z.infer<typeof CorporateEventSchema>;

/** What the user actually received from this asset. */
export const UserAssetIncomeSchema = z.object({
  last12Months: NonNegativeCentsSchema,
  allTime: NonNegativeCentsSchema,
  payments: z.array(z.object({ paymentDate: IsoDateSchema, amount: PositiveCentsSchema })),
});
export type UserAssetIncome = z.infer<typeof UserAssetIncomeSchema>;

export const AssetDetailSchema = z.object({
  asset: AssetSchema,
  indicators: z.array(AssetIndicatorsSchema),
  lastEarnings: EarningsReportSchema.nullable(),
  /** Most recent first. */
  dividends: z.array(DividendSchema),
  events: z.array(CorporateEventSchema),
  /** `null` when the user never held the asset. */
  userIncome: UserAssetIncomeSchema.nullable(),
  userPositionIds: z.array(PositionIdSchema),
});
export type AssetDetail = z.infer<typeof AssetDetailSchema>;
