/** Net worth ("patrimônio"): investments plus properties minus their debts. */
import { z } from 'zod';

import { IsoDateSchema, IsoDateTimeSchema } from './common';
import { CentsSchema, NonNegativeCentsSchema } from './money';
import { PercentSchema } from './percent';

export const EvolutionRangeSchema = z.enum(['6m', '12m', 'all']);
export type EvolutionRange = z.infer<typeof EvolutionRangeSchema>;

export const ReturnsSchema = z.object({
  month: PercentSchema.nullable(),
  year: PercentSchema.nullable(),
  twelveMonths: PercentSchema.nullable(),
});
export type Returns = z.infer<typeof ReturnsSchema>;

export const WealthOverviewSchema = z.object({
  /** Sum of investment positions. */
  invested: NonNegativeCentsSchema.nullable(),
  /** Declared/FIPE value of properties. */
  properties: NonNegativeCentsSchema.nullable(),
  /** Outstanding debt of properties (financing). */
  debts: NonNegativeCentsSchema.nullable(),
  /** `invested + properties − debts`. */
  total: CentsSchema.nullable(),
  /** Portfolio return. */
  returns: ReturnsSchema,
  /** CDI over the same windows, for comparison. */
  cdi: ReturnsSchema,
  contributionsThisYear: NonNegativeCentsSchema.nullable(),
  dividendsThisYear: NonNegativeCentsSchema.nullable(),
  updatedAt: IsoDateTimeSchema.nullable(),
});
export type WealthOverview = z.infer<typeof WealthOverviewSchema>;

export const EvolutionPointSchema = z.object({
  /** Last day of the month (or today for the current month). */
  date: IsoDateSchema,
  value: NonNegativeCentsSchema,
  invested: NonNegativeCentsSchema,
  /** Cumulative portfolio return since the first point. */
  cumulativeReturn: PercentSchema,
  /** Cumulative CDI since the first point. */
  cumulativeCdi: PercentSchema,
});
export type EvolutionPoint = z.infer<typeof EvolutionPointSchema>;

export const WealthEvolutionSchema = z.object({
  range: EvolutionRangeSchema,
  points: z.array(EvolutionPointSchema),
});
export type WealthEvolution = z.infer<typeof WealthEvolutionSchema>;
