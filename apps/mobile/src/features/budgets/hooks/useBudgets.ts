import { cents, subtractCents } from '@guara/utils';

// Straight to the files: Gastos reads the caps back from this feature's store.
import { categoryLabel } from '@/features/spending/categories';
import { LEDGER, SPENDING_MONTH, SPENDING_TODAY } from '@/features/spending/data';
import { categoryDelta } from '@/features/spending/lib/ledger';
import { useSpendingStore } from '@/features/spending/store';

import { BUDGET_MONTH, type BudgetItem } from '../data';
import { budgetStatus, usedPercent, type BudgetView } from '../lib/budgets';
import { useBudgetsStore } from '../store';

/** A cap with the month's figures (spent with the edits made in Lançamentos). */
export function budgetView(
  item: BudgetItem,
  delta: (categoryId: BudgetItem['categoryId']) => number,
): BudgetView {
  const month = BUDGET_MONTH[item.categoryId];
  const spent = cents(Math.max(0, (month?.spent ?? 0) + delta(item.categoryId)));
  return {
    id: item.id,
    categoryId: item.categoryId,
    label: categoryLabel(item.categoryId),
    limit: item.limit,
    warnings: item.warnings,
    spent,
    percent: usedPercent(spent, item.limit),
    status: budgetStatus(spent, item.limit),
    remaining: spent > item.limit ? null : subtractCents(item.limit, spent),
    projectedSpent: month?.projectedSpent ?? null,
    notices: month?.notices ?? [],
  };
}

/** Caps of the month. Static data today; `budgets.list` when the API exists. */
export function useBudgets() {
  const items = useBudgetsStore((state) => state.budgets);
  const edits = useSpendingStore((state) => state.edits);
  const delta = (categoryId: BudgetItem['categoryId']) =>
    categoryDelta(LEDGER, edits, categoryId).spent;
  return {
    month: SPENDING_MONTH,
    today: SPENDING_TODAY,
    items,
    budgets: items.map((item) => budgetView(item, delta)),
  };
}
