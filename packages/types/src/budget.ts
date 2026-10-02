/** Monthly spending caps ("tetos de gasto") per category. */
import { z } from 'zod';

import { CategoryIdSchema } from './category';
import { YearMonthSchema, timestamps } from './common';
import { BudgetIdSchema } from './ids';
import { NonNegativeCentsSchema, PositiveCentsSchema } from './money';
import { PercentSchema } from './percent';

/**
 * Intermediate warnings as percentages of the cap, ascending and below 100
 * (e.g. `[50, 80]`). Reaching 100% always notifies, so it is not listed.
 */
export const WarningThresholdsSchema = z
  .array(z.int().min(1).max(99))
  .max(3)
  .refine((values) => values.every((value, index) => index === 0 || value > values[index - 1]!), {
    message: 'Thresholds must be strictly ascending',
  });

/** `ok` below the first warning, `warning` from the first warning, `exceeded` from 100%. */
export const BudgetStatusSchema = z.enum(['ok', 'warning', 'exceeded']);
export type BudgetStatus = z.infer<typeof BudgetStatusSchema>;

export const BudgetSchema = z.object({
  id: BudgetIdSchema,
  categoryId: CategoryIdSchema,
  /** Month the `spent` figures refer to. */
  month: YearMonthSchema,
  limit: PositiveCentsSchema,
  warningThresholds: WarningThresholdsSchema,
  /** Sum of the month's outgoing transactions in the category. */
  spent: NonNegativeCentsSchema,
  /** `spent / limit` in percentage points (may pass 100). */
  usedPercent: PercentSchema,
  status: BudgetStatusSchema,
  /** Thresholds already notified this month (100 = cap reached). */
  triggeredWarnings: z.array(z.int().min(1).max(100)),
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
  warningThresholds: WarningThresholdsSchema,
});
export type CreateBudgetBody = z.infer<typeof CreateBudgetBodySchema>;

export const UpdateBudgetBodySchema = z.object({
  limit: PositiveCentsSchema.optional(),
  warningThresholds: WarningThresholdsSchema.optional(),
});
export type UpdateBudgetBody = z.infer<typeof UpdateBudgetBodySchema>;
