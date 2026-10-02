import type { CategoryId, YearMonth } from '@guara/types';
import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';

import { budgetKeys } from './keys';

/** Spending caps with the spending of `month` (current month when omitted). */
export function useBudgets(month?: YearMonth) {
  return useQuery({
    queryKey: budgetKeys.list(month),
    queryFn: ({ signal }) => apiRequest('budgets.list', { query: { month }, signal }),
  });
}

export function useBudget(budgetId: string, month?: YearMonth) {
  return useQuery({
    queryKey: budgetKeys.detail(budgetId, month),
    queryFn: ({ signal }) =>
      apiRequest('budgets.get', { params: { budgetId }, query: { month }, signal }),
  });
}

/** History of a category shown while creating a cap. Pass `limit` to see months over it. */
export function useBudgetPreview(categoryId: CategoryId | null, limit?: number) {
  return useQuery({
    queryKey: budgetKeys.preview(categoryId ?? 'other', limit),
    queryFn: ({ signal }) =>
      apiRequest('budgets.preview', { query: { categoryId: categoryId!, limit }, signal }),
    enabled: categoryId !== null,
  });
}
