import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_ROOTS } from '@/constants/query-keys';
import { apiRequest } from '@/lib/api';
import { invalidateRoots } from '@/lib/query-client';

/** Token to open the Malvo widget. Pass a connection id to renew its consent. */
export function useConnectToken() {
  return useMutation({
    mutationFn: (connectionId?: string) =>
      apiRequest('bankConnections.connectToken', { body: { connectionId } }),
  });
}

export function useRevokeConsent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (connectionId: string) =>
      apiRequest('bankConnections.revoke', { params: { connectionId } }),
    onSuccess: () =>
      invalidateRoots(queryClient, [
        QUERY_ROOTS.bankConnections,
        QUERY_ROOTS.accounts,
        QUERY_ROOTS.dashboard,
        QUERY_ROOTS.plan,
      ]),
  });
}
