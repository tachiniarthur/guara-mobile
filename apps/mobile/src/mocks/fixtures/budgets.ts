import type { CategoryId } from '@guara/types';

import { instantAt } from '../clock';
import type { BudgetRecord, MockDb } from '../db';
import { currentMonth, spentIn } from '../logic/spending';

const STEP = 5_000; // caps are round numbers (R$ 50)

/**
 * Caps are derived from what was actually spent this month, so the planned states hold
 * whatever the random amounts are: restaurants in warning, shopping exceeded, two ok.
 */
export function buildBudgets(db: MockDb): BudgetRecord[] {
  const month = currentMonth(db);
  const make = (
    categoryId: CategoryId,
    warningThresholds: number[],
    usage: number,
    rounding: 'up' | 'down',
  ): BudgetRecord => {
    const exact = spentIn(db, categoryId, month) / usage;
    const steps = rounding === 'up' ? Math.ceil(exact / STEP) : Math.floor(exact / STEP);
    const createdAt = instantAt('2026-06-03', '20:15');
    return {
      id: `bud_${categoryId}`,
      categoryId,
      limit: Math.max(STEP, steps * STEP),
      warningThresholds,
      createdAt,
      updatedAt: createdAt,
    };
  };
  return [
    make('restaurants', [50, 80], 0.86, 'up'),
    make('shopping', [50, 80], 1.15, 'down'),
    make('groceries', [80], 0.62, 'up'),
    make('transport', [70, 90], 0.45, 'up'),
  ];
}
