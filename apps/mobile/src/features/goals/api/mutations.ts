import type { ApiBody } from '@guara/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_ROOTS } from '@/constants/query-keys';
import { apiRequest } from '@/lib/api';
import { invalidateRoots } from '@/lib/query-client';

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ApiBody<'goals.create'>) => apiRequest('goals.create', { body }),
    onSuccess: () => invalidateRoots(queryClient, [QUERY_ROOTS.goals]),
  });
}

/** Also unlinks the simulation it came from. */
export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goalId: string) => apiRequest('goals.delete', { params: { goalId } }),
    onSuccess: () => invalidateRoots(queryClient, [QUERY_ROOTS.goals, QUERY_ROOTS.simulations]),
  });
}
