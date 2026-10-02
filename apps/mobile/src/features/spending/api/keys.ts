import type { ApiQuery, UnusualStatus } from '@guara/types';

import { QUERY_ROOTS } from '@/constants/query-keys';

/** Transaction list filters (everything but the cursor). */
export type TransactionFilters = Omit<ApiQuery<'transactions.list'>, 'cursor'>;

export const transactionKeys = {
  all: [QUERY_ROOTS.transactions] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters: TransactionFilters = {}) => [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (transactionId: string) => [...transactionKeys.details(), transactionId] as const,
};

export const categoryKeys = {
  all: [QUERY_ROOTS.categories] as const,
};

export const unusualKeys = {
  all: [QUERY_ROOTS.unusual] as const,
  list: (status?: UnusualStatus) => [...unusualKeys.all, 'list', status ?? 'all'] as const,
};
