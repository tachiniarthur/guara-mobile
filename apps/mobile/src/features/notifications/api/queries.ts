import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';
import { STALE_TIME } from '@/lib/query-client';

import { notificationKeys } from './keys';

export function useNotifications(unreadOnly = false) {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(unreadOnly),
    queryFn: ({ pageParam, signal }) =>
      apiRequest('notifications.list', { query: { unreadOnly, cursor: pageParam }, signal }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

/** Badge counter. */
export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: ({ signal }) => apiRequest('notifications.unreadCount', { signal }),
    staleTime: STALE_TIME.live,
    select: (data) => data.count,
  });
}
