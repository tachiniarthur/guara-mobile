import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_ROOTS } from '@/constants/query-keys';
import { apiRequest } from '@/lib/api';
import { invalidateRoots } from '@/lib/query-client';

export function useMarkNotSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subscriptionId: string) =>
      apiRequest('subscriptions.markNotSubscription', { params: { subscriptionId } }),
    onSuccess: () =>
      invalidateRoots(queryClient, [QUERY_ROOTS.subscriptions, QUERY_ROOTS.dashboard]),
  });
}
