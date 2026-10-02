import { QUERY_ROOTS } from '@/constants/query-keys';

export const simulationKeys = {
  all: [QUERY_ROOTS.simulations] as const,
  list: () => [...simulationKeys.all, 'list'] as const,
  detail: (simulationId: string) => [...simulationKeys.all, 'detail', simulationId] as const,
};
