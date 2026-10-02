import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';

import { bankConnectionKeys } from './keys';

export function useBankConnections() {
  return useQuery({
    queryKey: bankConnectionKeys.list(),
    queryFn: ({ signal }) => apiRequest('bankConnections.list', { signal }),
  });
}

export function useBankConnection(connectionId: string) {
  return useQuery({
    queryKey: bankConnectionKeys.detail(connectionId),
    queryFn: ({ signal }) =>
      apiRequest('bankConnections.get', { params: { connectionId }, signal }),
  });
}

/** Accounts and cards of every active connection. */
export function useAccounts() {
  return useQuery({
    queryKey: bankConnectionKeys.accounts,
    queryFn: ({ signal }) => apiRequest('accounts.list', { signal }),
  });
}
