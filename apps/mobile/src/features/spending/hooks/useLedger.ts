import type { CategoryId, UnusualReason, UnusualStatus } from '@guara/types';

import {
  BANK_SYNC,
  CATEGORY_DETAILS,
  CATEGORY_TOTALS,
  LEDGER,
  LEDGER_ACCOUNTS,
  MONTH_BUDGETS,
  SPENDING,
  SPENDING_MONTH,
  TRANSACTION_SUMMARIES,
  UNUSUAL,
  type SpendingBankId,
} from '../data';
import {
  adjustSummary,
  applyEdits,
  budgetsWithEdits,
  categorySummary,
  categoryTotalsWithEdits,
} from '../lib/ledger';
import { staleBanksMessage } from '../lib/format';
import { useSpendingStore } from '../store';

/** `empty`: no bank connected yet; `error`: the transactions could not be loaded. */
export type LedgerStatus = 'ready' | 'empty' | 'error';

export interface UnusualInfo {
  reasons: UnusualReason[];
  status: UnusualStatus;
}

/**
 * Lançamentos of the month with the user's edits applied, plus everything derived from them
 * (caps, category totals, headers). Static data today; a TanStack query when the API exists.
 */
export function useLedger() {
  const edits = useSpendingStore((state) => state.edits);
  const transactions = LEDGER.map((tx) => applyEdits(tx, edits));
  const status: LedgerStatus = BANK_SYNC.length === 0 ? 'empty' : 'ready';

  const unusualOf = (id: string): UnusualInfo | null => {
    const base = UNUSUAL[id];
    if (!base) return null;
    return { reasons: base.reasons, status: edits.unusual[id] ?? base.status };
  };

  return {
    status,
    month: SPENDING_MONTH,
    transactions,
    accounts: LEDGER_ACCOUNTS,
    edits,
    unusualOf,
    budgets: budgetsWithEdits(MONTH_BUDGETS, LEDGER, edits),
    categoryTotals: categoryTotalsWithEdits(CATEGORY_TOTALS, LEDGER, edits),
    summaryFor: (bank: SpendingBankId) => adjustSummary(TRANSACTION_SUMMARIES[bank], LEDGER, edits),
    categorySummary: (categoryId: CategoryId) =>
      categorySummary(categoryId, {
        month: SPENDING_MONTH,
        totals: CATEGORY_TOTALS,
        budgets: MONTH_BUDGETS,
        details: CATEGORY_DETAILS,
        totalOut: SPENDING.totalOut,
        ledger: LEDGER,
        edits,
      }),
    staleMessage: staleBanksMessage(BANK_SYNC),
    /** Reloads the list (the API's refetch; nothing to do with static data). */
    refetch: () => undefined,
  };
}

export type Ledger = ReturnType<typeof useLedger>;
