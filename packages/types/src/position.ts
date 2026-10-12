/** Investment positions (from Open Finance or typed in by the user). */
import { z } from 'zod';

import { DecimalStringSchema, IsoDateTimeSchema, timestamps } from './common';
import { BankConnectionIdSchema, PositionIdSchema, TickerSchema } from './ids';
import { NonNegativeCentsSchema, PositiveCentsSchema } from './money';
import { AllocationSubclassSchema } from './allocation';
import { ShareSchema } from './percent';

/**
 * Classes of the positions list. The target allocation uses the 5 groups and their subclasses
 * (`allocation.ts`). Properties (real estate, vehicles) are NOT part of the allocation.
 */
export const AssetClassSchema = z.enum(['fixed_income', 'equities', 'real_estate', 'alternatives']);
export type AssetClass = z.infer<typeof AssetClassSchema>;

export const InstrumentTypeSchema = z.enum([
  'cdb',
  'lci',
  'lca',
  'treasury',
  'debenture',
  'stock',
  'fii',
  'etf',
  'bdr',
  'crypto',
  'fund',
  'pension',
  'other',
]);
export type InstrumentType = z.infer<typeof InstrumentTypeSchema>;

export const RiskLevelSchema = z.enum(['low', 'medium', 'high']);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

export const PositionOriginSchema = z.enum(['open_finance', 'manual']);
export type PositionOrigin = z.infer<typeof PositionOriginSchema>;

/** Where the underlying asset is exposed. Positions use `null` when unknown (e.g. crypto). */
export const ExposureCountrySchema = z.enum(['BR', 'abroad']);
export type ExposureCountry = z.infer<typeof ExposureCountrySchema>;

export const InstrumentSchema = z.object({
  /** Display name, e.g. "CDB Banco Aurora 110% CDI" or "Petrobras PN". */
  name: z.string().min(1),
  /** Listed instruments only. */
  ticker: TickerSchema.nullable(),
  type: InstrumentTypeSchema,
});
export type Instrument = z.infer<typeof InstrumentSchema>;

export const PositionSchema = z.object({
  id: PositionIdSchema,
  class: AssetClassSchema,
  /** Where the position counts in the target allocation. */
  subclass: AllocationSubclassSchema,
  instrument: InstrumentSchema,
  risk: RiskLevelSchema,
  /** Units held (shares, quotas, coins). `null` for instruments tracked only by value. */
  quantity: DecimalStringSchema.nullable(),
  /** Average price per unit. */
  averagePrice: NonNegativeCentsSchema.nullable(),
  /** Total amount put in. */
  investedAmount: NonNegativeCentsSchema.nullable(),
  currentValue: NonNegativeCentsSchema.nullable(),
  /** Share of the portfolio (2 decimals; all positions with value sum to 100). */
  portfolioPercent: ShareSchema.nullable(),
  origin: PositionOriginSchema,
  country: ExposureCountrySchema.nullable(),
  /** Custodian/bank name, when known. */
  institutionName: z.string().min(1).nullable(),
  connectionId: BankConnectionIdSchema.nullable(),
  /** When `currentValue` was last refreshed. */
  valueUpdatedAt: IsoDateTimeSchema.nullable(),
  ...timestamps,
});
export type Position = z.infer<typeof PositionSchema>;

export const PositionListQuerySchema = z.object({ class: AssetClassSchema.optional() });
export type PositionListQuery = z.infer<typeof PositionListQuerySchema>;

export const PositionListSchema = z.object({
  items: z.array(PositionSchema),
  total: NonNegativeCentsSchema,
});
export type PositionList = z.infer<typeof PositionListSchema>;

export const CreateManualPositionBodySchema = z.object({
  class: AssetClassSchema,
  instrument: InstrumentSchema,
  risk: RiskLevelSchema,
  quantity: DecimalStringSchema.nullable(),
  averagePrice: PositiveCentsSchema.nullable(),
  investedAmount: PositiveCentsSchema,
  /** Leave `null` to let the API price listed instruments. */
  currentValue: NonNegativeCentsSchema.nullable(),
  country: ExposureCountrySchema.nullable(),
});
export type CreateManualPositionBody = z.infer<typeof CreateManualPositionBodySchema>;

export const ExposureSliceSchema = z.object({
  country: ExposureCountrySchema.nullable(),
  value: NonNegativeCentsSchema,
  percent: ShareSchema,
});
export type ExposureSlice = z.infer<typeof ExposureSliceSchema>;

export const ExposureSchema = z.object({
  items: z.array(ExposureSliceSchema),
  total: NonNegativeCentsSchema,
});
export type Exposure = z.infer<typeof ExposureSchema>;
