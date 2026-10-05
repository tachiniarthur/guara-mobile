import type { CategoryId, UnusualStatus } from '@guara/types';
import { create } from 'zustand';

import type { LedgerTransaction } from './data';
import { NO_EDITS, merchantKey, type LedgerEdits } from './lib/ledger';

interface SpendingState {
  edits: LedgerEdits;
  /** New category for one transaction; `forMerchant` also applies it to the same store. */
  recategorize: (tx: LedgerTransaction, categoryId: CategoryId, forMerchant: boolean) => void;
  setDuplicate: (id: string, duplicate: boolean) => void;
  setHidden: (id: string, hidden: boolean) => void;
  setNote: (id: string, note: string | null) => void;
  setUnusualStatus: (id: string, status: UnusualStatus) => void;
  markNotSubscription: (tx: LedgerTransaction) => void;
  reset: () => void;
}

/**
 * What the user changed in Lançamentos. Local until the API exists; then each action becomes
 * a mutation (`transactions.correctCategory`, `transactions.update`, `unusual.*`).
 */
export const useSpendingStore = create<SpendingState>()((set) => ({
  edits: NO_EDITS,
  recategorize: (tx, categoryId, forMerchant) =>
    set(({ edits }) => {
      const key = merchantKey(tx);
      const merchantRules = { ...edits.merchantRules };
      if (forMerchant) merchantRules[key] = categoryId;
      else delete merchantRules[key];
      return {
        edits: {
          ...edits,
          categories: { ...edits.categories, [tx.id]: categoryId },
          merchantRules,
        },
      };
    }),
  setDuplicate: (id, duplicate) =>
    set(({ edits }) => ({
      edits: { ...edits, duplicates: { ...edits.duplicates, [id]: duplicate } },
    })),
  setHidden: (id, hidden) =>
    set(({ edits }) => ({ edits: { ...edits, hidden: { ...edits.hidden, [id]: hidden } } })),
  setNote: (id, note) =>
    set(({ edits }) => ({ edits: { ...edits, notes: { ...edits.notes, [id]: note } } })),
  setUnusualStatus: (id, status) =>
    set(({ edits }) => ({ edits: { ...edits, unusual: { ...edits.unusual, [id]: status } } })),
  markNotSubscription: (tx) =>
    set(({ edits }) => ({
      edits: { ...edits, notSubscription: { ...edits.notSubscription, [merchantKey(tx)]: true } },
    })),
  reset: () => set({ edits: NO_EDITS }),
}));
