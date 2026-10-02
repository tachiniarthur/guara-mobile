import type { ApiBody } from '@guara/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_ROOTS } from '@/constants/query-keys';
import { apiRequest } from '@/lib/api';
import { invalidateRoots } from '@/lib/query-client';

export function useCreatePriceAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ApiBody<'priceAlerts.create'>) => apiRequest('priceAlerts.create', { body }),
    onSuccess: () => invalidateRoots(queryClient, [QUERY_ROOTS.priceAlerts]),
  });
}

export function useCancelPriceAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => apiRequest('priceAlerts.cancel', { params: { alertId } }),
    onSuccess: () => invalidateRoots(queryClient, [QUERY_ROOTS.priceAlerts]),
  });
}
