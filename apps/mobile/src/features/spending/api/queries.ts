import type { UnusualStatus } from '@guara/types';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';
import { STALE_TIME } from '@/lib/query-client';

import { categoryKeys, transactionKeys, unusualKeys, type TransactionFilters } from './keys';

/** Fixed category list (labels and icons). */
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: ({ signal }) => apiRequest('categories.list', { signal }),
    staleTime: STALE_TIME.static,
  });
}

/** Transactions, newest first, loaded page by page (`fetchNextPage`). */
export function useTransactions(filters: TransactionFilters = {}) {
  return useInfiniteQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: ({ pageParam, signal }) =>
      apiRequest('transactions.list', { query: { ...filters, cursor: pageParam }, signal }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useTransaction(transactionId: string) {
  return useQuery({
    queryKey: transactionKeys.detail(transactionId),
    queryFn: ({ signal }) => apiRequest('transactions.get', { params: { transactionId }, signal }),
  });
}

export function useUnusualTransactions(status?: UnusualStatus) {
  return useQuery({
    queryKey: unusualKeys.list(status),
    queryFn: ({ signal }) => apiRequest('unusual.list', { query: { status }, signal }),
  });
}
