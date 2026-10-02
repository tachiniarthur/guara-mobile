import type { CategoryId, YearMonth } from '@guara/types';

import { QUERY_ROOTS } from '@/constants/query-keys';

/** Omitted month = current month (resolved by the API). */
const monthKey = (month?: YearMonth) => month ?? 'current';

export const budgetKeys = {
  all: [QUERY_ROOTS.budgets] as const,
  lists: () => [...budgetKeys.all, 'list'] as const,
  list: (month?: YearMonth) => [...budgetKeys.lists(), monthKey(month)] as const,
  details: () => [...budgetKeys.all, 'detail'] as const,
  detail: (budgetId: string, month?: YearMonth) =>
    [...budgetKeys.details(), budgetId, monthKey(month)] as const,
  preview: (categoryId: CategoryId, limit?: number) =>
    [...budgetKeys.all, 'preview', categoryId, limit ?? null] as const,
};
