import type { ApiBody } from '@guara/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_ROOTS } from '@/constants/query-keys';
import { apiRequest } from '@/lib/api';
import { invalidateRoots } from '@/lib/query-client';

/** Everything derived from the positions. */
const PORTFOLIO = [
  QUERY_ROOTS.positions,
  QUERY_ROOTS.allocation,
  QUERY_ROOTS.exposure,
  QUERY_ROOTS.wealth,
  QUERY_ROOTS.duplicates,
  QUERY_ROOTS.assets,
];

export function useCreateManualPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ApiBody<'positions.createManual'>) =>
      apiRequest('positions.createManual', { body }),
    onSuccess: () => invalidateRoots(queryClient, PORTFOLIO),
  });
}

export function useDeletePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (positionId: string) => apiRequest('positions.delete', { params: { positionId } }),
    onSuccess: () => invalidateRoots(queryClient, PORTFOLIO),
  });
}

export function useResolveDuplicate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      duplicateId,
      resolution,
    }: {
      duplicateId: string;
      resolution: ApiBody<'duplicates.resolve'>;
    }) => apiRequest('duplicates.resolve', { params: { duplicateId }, body: resolution }),
    onSuccess: () => invalidateRoots(queryClient, PORTFOLIO),
  });
}
