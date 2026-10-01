import type { Entity } from './common';
import type { Cents } from './money';

export type BudgetPeriod = 'monthly';

export interface Budget extends Entity {
  categoryId: string;
  period: BudgetPeriod;
  /** Spending cap for the period. */
  limit: Cents;
  /** Intermediate warnings as percentages of the limit (e.g. [50, 80]). */
  warningThresholds: number[];
  spent: Cents;
}

/** Preview shown before creating a budget. Missing values must render as "—". */
export interface BudgetPreview {
  currentSpent: Cents | null;
  threeMonthAverage: Cents | null;
  highestMonth: Cents | null;
}
