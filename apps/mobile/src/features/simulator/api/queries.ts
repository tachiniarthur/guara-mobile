import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';

import { simulationKeys } from './keys';

export function useSimulations() {
  return useQuery({
    queryKey: simulationKeys.list(),
    queryFn: ({ signal }) => apiRequest('simulations.list', { signal }),
  });
}

export function useSimulation(simulationId: string) {
  return useQuery({
    queryKey: simulationKeys.detail(simulationId),
    queryFn: ({ signal }) => apiRequest('simulations.get', { params: { simulationId }, signal }),
  });
}
