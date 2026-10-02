import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';
import { STALE_TIME } from '@/lib/query-client';

import { priceAlertKeys } from './keys';

/** Alerts carry the current price, so they follow the quotes freshness. */
export function usePriceAlerts() {
  return useQuery({
    queryKey: priceAlertKeys.list(),
    queryFn: ({ signal }) => apiRequest('priceAlerts.list', { signal }),
    staleTime: STALE_TIME.quotes,
  });
}

export function usePriceAlert(alertId: string) {
  return useQuery({
    queryKey: priceAlertKeys.detail(alertId),
    queryFn: ({ signal }) => apiRequest('priceAlerts.get', { params: { alertId }, signal }),
    staleTime: STALE_TIME.quotes,
  });
}
