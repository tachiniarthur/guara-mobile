import type { ApiBody } from '@guara/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_ROOTS } from '@/constants/query-keys';
import { apiRequest } from '@/lib/api';
import { invalidateRoots } from '@/lib/query-client';

/** Computes a projection without saving it (the form calls it as inputs change). */
export function useRunSimulation() {
  return useMutation({
    mutationFn: (body: ApiBody<'simulations.run'>) => apiRequest('simulations.run', { body }),
  });
}

export function useSaveSimulation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ApiBody<'simulations.save'>) => apiRequest('simulations.save', { body }),
    onSuccess: () => invalidateRoots(queryClient, [QUERY_ROOTS.simulations]),
  });
}

export function useDeleteSimulation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (simulationId: string) =>
      apiRequest('simulations.delete', { params: { simulationId } }),
    onSuccess: () => invalidateRoots(queryClient, [QUERY_ROOTS.simulations, QUERY_ROOTS.goals]),
  });
}

export function useConvertSimulationToGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ simulationId, name }: { simulationId: string; name?: string }) =>
      apiRequest('simulations.convertToGoal', { params: { simulationId }, body: { name } }),
    onSuccess: () => invalidateRoots(queryClient, [QUERY_ROOTS.simulations, QUERY_ROOTS.goals]),
  });
}
