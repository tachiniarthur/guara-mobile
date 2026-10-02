import { z } from 'zod';

import { InvestorProfileTypeSchema } from './investor-profile';
import { NonNegativeCentsSchema, PositiveCentsSchema } from './money';
import { ShareSchema } from './percent';
import { AssetClassSchema } from './position';

export const AllocationSliceSchema = z.object({
  class: AssetClassSchema,
  currentValue: NonNegativeCentsSchema,
  /** 2 decimals; the slices sum to 100 when the portfolio has value. */
  currentPercent: ShareSchema,
  /** Target from the investor profile; `null` without a profile. */
  targetPercent: ShareSchema.nullable(),
});
export type AllocationSlice = z.infer<typeof AllocationSliceSchema>;

/** Move that brings a class to its target. Informational — never an investment advice. */
export const RebalanceMoveSchema = z.object({
  class: AssetClassSchema,
  action: z.enum(['buy', 'sell']),
  amount: PositiveCentsSchema,
});
export type RebalanceMove = z.infer<typeof RebalanceMoveSchema>;

export const AllocationSchema = z.object({
  profile: InvestorProfileTypeSchema.nullable(),
  total: NonNegativeCentsSchema,
  /** Always the four classes, in a fixed order. */
  slices: z.array(AllocationSliceSchema),
  /** `null` without a profile; empty when already on target. */
  rebalance: z.array(RebalanceMoveSchema).nullable(),
});
export type Allocation = z.infer<typeof AllocationSchema>;
