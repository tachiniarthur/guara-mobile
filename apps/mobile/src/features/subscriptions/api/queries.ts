import type { YearMonth } from '@guara/types';
import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';

import { subscriptionKeys } from './keys';

export function useSubscriptions() {
  return useQuery({
    queryKey: subscriptionKeys.list(),
    queryFn: ({ signal }) => apiRequest('subscriptions.list', { signal }),
  });
}

export function useSubscription(subscriptionId: string) {
  return useQuery({
    queryKey: subscriptionKeys.detail(subscriptionId),
    queryFn: ({ signal }) =>
      apiRequest('subscriptions.get', { params: { subscriptionId }, signal }),
  });
}

/** Expected charges of `month` (current month when omitted). */
export function useSubscriptionCalendar(month?: YearMonth) {
  return useQuery({
    queryKey: subscriptionKeys.calendar(month),
    queryFn: ({ signal }) => apiRequest('subscriptions.calendar', { query: { month }, signal }),
  });
}
