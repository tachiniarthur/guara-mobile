import { z } from 'zod';

import { InvestorProfileTypeSchema } from './investor-profile';
import { NonNegativeCentsSchema } from './money';
import { ShareSchema } from './percent';

/** The 5 groups of the target allocation, in the order of the design. */
export const AllocationGroupKeySchema = z.enum([
  'brFixed',
  'intlFixed',
  'brEquity',
  'intlEquity',
  'crypto',
]);
export type AllocationGroupKey = z.infer<typeof AllocationGroupKeySchema>;

/** Subclasses of the groups (stable keys; the app names them per profile). */
export const AllocationSubclassSchema = z.enum([
  'postFixed',
  'inflation',
  'prefixed',
  'privateCredit',
  'treasuries',
  'bonds',
  'distressedDebt',
  'largeCaps',
  'smallCaps',
  'reits',
  'intlEtfs',
  'intlStocks',
  'intlFunds',
  'privateEquity',
  'bitcoin',
  'ethereum',
  'altcoins',
  'stablecoins',
]);
export type AllocationSubclass = z.infer<typeof AllocationSubclassSchema>;

export const AllocationSubclassRowSchema = z.object({
  subclass: AllocationSubclassSchema,
  currentValue: NonNegativeCentsSchema,
  /** 1 decimal. */
  currentPercent: ShareSchema,
  /** 0 when the profile leaves the subclass out; `null` without a profile. */
  targetPercent: ShareSchema.nullable(),
});
export type AllocationSubclassRow = z.infer<typeof AllocationSubclassRowSchema>;

export const AllocationGroupRowSchema = z.object({
  group: AllocationGroupKeySchema,
  currentValue: NonNegativeCentsSchema,
  /** 1 decimal. */
  currentPercent: ShareSchema,
  /** Target from the investor profile; `null` without a profile. */
  targetPercent: ShareSchema.nullable(),
  /** Target in reais over the total ("alvo R$ 23.189,23"); `null` without a profile. */
  targetValue: NonNegativeCentsSchema.nullable(),
  /** The profile's subclasses plus any held subclass the profile leaves out. */
  subclasses: z.array(AllocationSubclassRowSchema),
});
export type AllocationGroupRow = z.infer<typeof AllocationGroupRowSchema>;

/**
 * Current × target allocation (properties are left out). Informational: the app shows the
 * distance to the target and never buys or sells.
 */
export const AllocationSchema = z.object({
  profile: InvestorProfileTypeSchema.nullable(),
  total: NonNegativeCentsSchema,
  /** Always the five groups, in a fixed order. */
  groups: z.array(AllocationGroupRowSchema),
});
export type Allocation = z.infer<typeof AllocationSchema>;
