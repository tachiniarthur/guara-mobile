import { z } from 'zod';

import { BudgetStatusSchema } from './budget';
import { CategoryIdSchema } from './category';
import { IsoDateTimeSchema, YearMonthSchema } from './common';
import { BudgetIdSchema } from './ids';
import { CentsSchema, NonNegativeCentsSchema, PositiveCentsSchema } from './money';
import { AppNotificationSchema } from './notification';
import { PercentSchema } from './percent';

export const BudgetSummarySchema = z.object({
  budgetId: BudgetIdSchema,
  categoryId: CategoryIdSchema,
  limit: PositiveCentsSchema,
  spent: NonNegativeCentsSchema,
  usedPercent: PercentSchema,
  status: BudgetStatusSchema,
});
export type BudgetSummary = z.infer<typeof BudgetSummarySchema>;

/**
 * Home screen. Amounts are `null` when there is no data to compute them
 * (e.g. no bank connected yet), never `0`.
 */
export const DashboardSchema = z.object({
  month: YearMonthSchema,
  /** Sum of checking and savings balances (credit cards are not included). */
  consolidatedBalance: CentsSchema.nullable(),
  monthIncome: NonNegativeCentsSchema.nullable(),
  monthExpenses: NonNegativeCentsSchema.nullable(),
  /** Projected balance at the end of the month (known recurring charges and income). */
  monthEndForecast: CentsSchema.nullable(),
  budgets: z.object({
    total: z.int().nonnegative(),
    warning: z.int().nonnegative(),
    exceeded: z.int().nonnegative(),
    /** Most used caps first (up to 3). */
    top: z.array(BudgetSummarySchema),
  }),
  /** Latest alert-like notifications (budgets, unusual purchases, price alerts…). */
  recentAlerts: z.array(AppNotificationSchema),
  unreadNotifications: z.int().nonnegative(),
  updatedAt: IsoDateTimeSchema,
});
export type Dashboard = z.infer<typeof DashboardSchema>;
