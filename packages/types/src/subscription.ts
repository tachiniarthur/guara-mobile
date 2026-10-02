/** Recurring charges detected by the API in the user's transactions. */
import { z } from 'zod';

import { CategoryIdSchema } from './category';
import { IsoDateSchema, YearMonthSchema, timestamps } from './common';
import { AccountIdSchema, SubscriptionIdSchema } from './ids';
import { CurrencySchema, NonNegativeCentsSchema, PositiveCentsSchema } from './money';

export const BillingCycleSchema = z.enum(['weekly', 'monthly', 'quarterly', 'yearly']);
export type BillingCycle = z.infer<typeof BillingCycleSchema>;

/** `not_subscription`: the user said this recurring charge is not a subscription. */
export const SubscriptionStatusSchema = z.enum(['active', 'not_subscription']);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

export const PriceIncreaseSchema = z.object({
  previousAmount: PositiveCentsSchema,
  /** Date of the first charge with the new amount. */
  changedOn: IsoDateSchema,
});
export type PriceIncrease = z.infer<typeof PriceIncreaseSchema>;

export const SubscriptionSchema = z.object({
  id: SubscriptionIdSchema,
  merchantName: z.string().min(1),
  amount: PositiveCentsSchema,
  currency: CurrencySchema,
  cycle: BillingCycleSchema,
  categoryId: CategoryIdSchema,
  accountId: AccountIdSchema.nullable(),
  lastChargedOn: IsoDateSchema.nullable(),
  nextChargeOn: IsoDateSchema.nullable(),
  /** Set when the last charge is higher than the previous one. */
  priceIncrease: PriceIncreaseSchema.nullable(),
  /** No related usage spotted lately (e.g. no purchases inside the service). Heuristic. */
  apparentlyUnused: z.boolean(),
  status: SubscriptionStatusSchema,
  ...timestamps,
});
export type Subscription = z.infer<typeof SubscriptionSchema>;

export const SubscriptionListSchema = z.object({
  items: z.array(SubscriptionSchema),
  /** Active subscriptions normalised to a monthly amount. */
  monthlyTotal: NonNegativeCentsSchema,
});
export type SubscriptionList = z.infer<typeof SubscriptionListSchema>;

export const SubscriptionChargeSchema = z.object({
  date: IsoDateSchema,
  subscriptionId: SubscriptionIdSchema,
  merchantName: z.string().min(1),
  amount: PositiveCentsSchema,
});
export type SubscriptionCharge = z.infer<typeof SubscriptionChargeSchema>;

export const SubscriptionCalendarSchema = z.object({
  month: YearMonthSchema,
  charges: z.array(SubscriptionChargeSchema),
  total: NonNegativeCentsSchema,
});
export type SubscriptionCalendar = z.infer<typeof SubscriptionCalendarSchema>;
