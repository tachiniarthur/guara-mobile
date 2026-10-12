/** Monthly spending caps ("tetos de gasto") per category. */
import { z } from 'zod';

import { CategoryIdSchema } from './category';
import { IsoDateTimeSchema, YearMonthSchema, timestamps } from './common';
import { BudgetIdSchema } from './ids';
import { NonNegativeCentsSchema, PositiveCentsSchema } from './money';
import { NotificationChannelSchema } from './notification';
import { PercentSchema } from './percent';

/**
 * Warnings before the cap, in reais, ascending and below the cap (e.g. R$ 500 and R$ 700 on a
 * R$ 1.000 cap). Reaching the cap always notifies, so it is not listed.
 */
export const BudgetWarningsSchema = z
  .array(PositiveCentsSchema)
  .max(3)
  .refine((values) => values.every((value, index) => index === 0 || value > values[index - 1]!), {
    message: 'Warnings must be strictly ascending',
  });

/** `ok` below 70% of the cap, `warning` from 70%, `exceeded` from 100%. */
export const BudgetStatusSchema = z.enum(['ok', 'warning', 'exceeded']);
export type BudgetStatus = z.infer<typeof BudgetStatusSchema>;

/** Where the warnings go (at least one). */
export const BudgetChannelsSchema = z
  .array(NotificationChannelSchema)
  .min(1)
  .refine((values) => new Set(values).size === values.length, {
    message: 'Channels must not repeat',
  });

/** A warning already sent this month (the cap itself included). */
export const BudgetNoticeSchema = z.object({
  amount: PositiveCentsSchema,
  sentAt: IsoDateTimeSchema,
  channels: z.array(NotificationChannelSchema).min(1),
});
export type BudgetNotice = z.infer<typeof BudgetNoticeSchema>;

export const BudgetSchema = z.object({
  id: BudgetIdSchema,
  categoryId: CategoryIdSchema,
  /** Month the `spent` figures refer to; the cap starts over on day 1. */
  month: YearMonthSchema,
  limit: PositiveCentsSchema,
  warnings: BudgetWarningsSchema,
  channels: BudgetChannelsSchema,
  /** Sum of the month's outgoing transactions in the category (credit and debit). */
  spent: NonNegativeCentsSchema,
  /** `spent / limit` in percentage points (may pass 100). */
  usedPercent: PercentSchema,
  status: BudgetStatusSchema,
  /** Spending at the end of the month at the current pace; `null` without enough history. */
  projectedSpent: NonNegativeCentsSchema.nullable(),
  /** Warnings already sent this month, oldest first. */
  notices: z.array(BudgetNoticeSchema),
  ...timestamps,
});
export type Budget = z.infer<typeof BudgetSchema>;

export const BudgetListSchema = z.object({
  month: YearMonthSchema,
  items: z.array(BudgetSchema),
  totalLimit: NonNegativeCentsSchema,
  totalSpent: NonNegativeCentsSchema,
});
export type BudgetList = z.infer<typeof BudgetListSchema>;

export const BudgetMonthSchema = z.object({
  month: YearMonthSchema,
  spent: NonNegativeCentsSchema,
  /** Cap of that month; `null` when the category had no cap. */
  limit: PositiveCentsSchema.nullable(),
});
export type BudgetMonth = z.infer<typeof BudgetMonthSchema>;

export const BudgetDetailSchema = z.object({
  budget: BudgetSchema,
  /** Previous months, oldest first (up to 6). */
  history: z.array(BudgetMonthSchema),
});
export type BudgetDetail = z.infer<typeof BudgetDetailSchema>;

export const BudgetPreviewQuerySchema = z.object({
  categoryId: CategoryIdSchema,
  /** Proposed cap; enables `monthsOverLimit`. */
  limit: PositiveCentsSchema.optional(),
});
export type BudgetPreviewQuery = z.infer<typeof BudgetPreviewQuerySchema>;

/** Shown before creating a cap. Missing history renders as "—". */
export const BudgetPreviewSchema = z.object({
  categoryId: CategoryIdSchema,
  currentSpent: NonNegativeCentsSchema.nullable(),
  /** Average of the last 3 full months. */
  threeMonthAverage: NonNegativeCentsSchema.nullable(),
  highestMonth: z.object({ month: YearMonthSchema, spent: NonNegativeCentsSchema }).nullable(),
  /** Last 6 full months that would have passed the proposed cap (empty without `limit`). */
  monthsOverLimit: z.array(YearMonthSchema),
});
export type BudgetPreview = z.infer<typeof BudgetPreviewSchema>;

export const CreateBudgetBodySchema = z.object({
  categoryId: CategoryIdSchema,
  limit: PositiveCentsSchema,
  warnings: BudgetWarningsSchema,
  channels: BudgetChannelsSchema,
});
export type CreateBudgetBody = z.infer<typeof CreateBudgetBodySchema>;

export const UpdateBudgetBodySchema = z.object({
  limit: PositiveCentsSchema.optional(),
  warnings: BudgetWarningsSchema.optional(),
  channels: BudgetChannelsSchema.optional(),
});
export type UpdateBudgetBody = z.infer<typeof UpdateBudgetBodySchema>;
