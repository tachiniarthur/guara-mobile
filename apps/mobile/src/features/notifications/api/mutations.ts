import type { AppNotification, Paginated, UnreadCount } from '@guara/types';
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';

import { QUERY_ROOTS } from '@/constants/query-keys';
import { apiRequest } from '@/lib/api';
import { invalidateRoots } from '@/lib/query-client';

import { notificationKeys } from './keys';

type NotificationPages = InfiniteData<Paginated<AppNotification>, string | undefined>;

/** Optimistically marks notifications as read in every cached list and the badge counter. */
async function markReadOptimistically(queryClient: QueryClient, ids: string[] | 'all') {
  await queryClient.cancelQueries({ queryKey: notificationKeys.all });
  const previousLists = queryClient.getQueriesData<NotificationPages>({
    queryKey: notificationKeys.lists(),
  });
  const previousCount = queryClient.getQueryData<UnreadCount>(notificationKeys.unreadCount());

  const readAt = new Date().toISOString();
  let marked = 0;
  const matches = (notification: AppNotification) =>
    notification.readAt === null && (ids === 'all' || ids.includes(notification.id));
  queryClient.setQueriesData<NotificationPages>({ queryKey: notificationKeys.lists() }, (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((item) => (matches(item) ? { ...item, readAt } : item)),
          })),
        }
      : data,
  );
  if (previousCount) {
    marked = ids === 'all' ? previousCount.count : Math.min(ids.length, previousCount.count);
    queryClient.setQueryData<UnreadCount>(notificationKeys.unreadCount(), {
      count: previousCount.count - marked,
    });
  }
  return { previousLists, previousCount };
}

function rollback(
  queryClient: QueryClient,
  context: Awaited<ReturnType<typeof markReadOptimistically>> | undefined,
) {
  if (!context) return;
  for (const [key, data] of context.previousLists) queryClient.setQueryData(key, data);
  queryClient.setQueryData(notificationKeys.unreadCount(), context.previousCount);
}

const AFFECTED = [QUERY_ROOTS.notifications, QUERY_ROOTS.dashboard];

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      apiRequest('notifications.markRead', { params: { notificationId } }),
    onMutate: (notificationId) => markReadOptimistically(queryClient, [notificationId]),
    onError: (_error, _id, context) => rollback(queryClient, context),
    onSettled: () => invalidateRoots(queryClient, AFFECTED),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest('notifications.markAllRead'),
    onMutate: () => markReadOptimistically(queryClient, 'all'),
    onError: (_error, _variables, context) => rollback(queryClient, context),
    onSettled: () => invalidateRoots(queryClient, AFFECTED),
  });
}
