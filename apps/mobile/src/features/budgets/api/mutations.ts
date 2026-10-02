import type { ApiBody } from '@guara/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_ROOTS } from '@/constants/query-keys';
import { apiRequest } from '@/lib/api';
import { invalidateRoots } from '@/lib/query-client';

/** Caps feed the dashboard summary too. */
const AFFECTED = [QUERY_ROOTS.budgets, QUERY_ROOTS.dashboard];

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ApiBody<'budgets.create'>) => apiRequest('budgets.create', { body }),
    onSuccess: () => invalidateRoots(queryClient, AFFECTED),
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ budgetId, ...body }: ApiBody<'budgets.update'> & { budgetId: string }) =>
      apiRequest('budgets.update', { params: { budgetId }, body }),
    onSuccess: () => invalidateRoots(queryClient, AFFECTED),
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (budgetId: string) => apiRequest('budgets.delete', { params: { budgetId } }),
    onSuccess: () => invalidateRoots(queryClient, AFFECTED),
  });
}
