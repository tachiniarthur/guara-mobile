import type { ApiBody, Paginated, Transaction } from '@guara/types';
import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';

import { QUERY_ROOTS } from '@/constants/query-keys';
import { apiRequest } from '@/lib/api';
import { invalidateRoots } from '@/lib/query-client';

import { transactionKeys } from './keys';

type TransactionPages = InfiniteData<Paginated<Transaction>, string | undefined>;

export type CorrectCategoryVariables = ApiBody<'transactions.correctCategory'> & {
  transactionId: string;
};

/**
 * Sets the category chosen by the user. Optimistic: lists and detail change right away and
 * roll back if the API fails; budgets, dashboard and reports refetch afterwards.
 */
export function useCorrectCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ transactionId, ...body }: CorrectCategoryVariables) =>
      apiRequest('transactions.correctCategory', { params: { transactionId }, body }),

    onMutate: async ({ transactionId, categoryId }) => {
      await queryClient.cancelQueries({ queryKey: transactionKeys.all });
      const detailKey = transactionKeys.detail(transactionId);
      const previousLists = queryClient.getQueriesData<TransactionPages>({
        queryKey: transactionKeys.lists(),
      });
      const previousDetail = queryClient.getQueryData<Transaction>(detailKey);

      const apply = (tx: Transaction): Transaction =>
        tx.id === transactionId ? { ...tx, userCategoryId: categoryId, categoryId } : tx;
      queryClient.setQueriesData<TransactionPages>({ queryKey: transactionKeys.lists() }, (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) => ({ ...page, items: page.items.map(apply) })),
            }
          : data,
      );
      if (previousDetail) queryClient.setQueryData(detailKey, apply(previousDetail));
      return { previousLists, previousDetail, detailKey };
    },

    onError: (_error, _variables, context) => {
      if (!context) return;
      for (const [key, data] of context.previousLists) queryClient.setQueryData(key, data);
      queryClient.setQueryData(context.detailKey, context.previousDetail);
    },

    onSettled: () =>
      invalidateRoots(queryClient, [
        QUERY_ROOTS.transactions,
        QUERY_ROOTS.budgets,
        QUERY_ROOTS.dashboard,
        QUERY_ROOTS.reports,
        QUERY_ROOTS.unusual,
      ]),
  });
}

/** The user confirms an unusual purchase was theirs. */
export function useAcknowledgeUnusual() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transactionId: string) =>
      apiRequest('unusual.acknowledge', { params: { transactionId } }),
    onSuccess: () => invalidateRoots(queryClient, [QUERY_ROOTS.unusual, QUERY_ROOTS.dashboard]),
  });
}
