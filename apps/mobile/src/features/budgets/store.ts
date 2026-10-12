import { create } from 'zustand';

import { BUDGETS, type BudgetItem } from './data';

interface BudgetsState {
  budgets: BudgetItem[];
  /** Creates a cap and returns its id. */
  add: (budget: Omit<BudgetItem, 'id'>) => string;
  update: (id: string, patch: Partial<Omit<BudgetItem, 'id' | 'categoryId'>>) => void;
  remove: (id: string) => void;
  reset: () => void;
}

/**
 * Spending caps with what the user changed in the app. Local until the API exists; then each
 * action becomes a mutation (`budgets.create`, `budgets.update`, `budgets.delete`).
 */
export const useBudgetsStore = create<BudgetsState>()((set) => ({
  budgets: BUDGETS,
  add: (budget) => {
    const id = `budget-${budget.categoryId}-${Date.now()}`;
    set(({ budgets }) => ({ budgets: [...budgets, { ...budget, id }] }));
    return id;
  },
  update: (id, patch) =>
    set(({ budgets }) => ({
      budgets: budgets.map((budget) => (budget.id === id ? { ...budget, ...patch } : budget)),
    })),
  remove: (id) => set(({ budgets }) => ({ budgets: budgets.filter((budget) => budget.id !== id) })),
  reset: () => set({ budgets: BUDGETS }),
}));
