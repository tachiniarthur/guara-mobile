import { QUERY_ROOTS } from '@/constants/query-keys';

export const notificationKeys = {
  all: [QUERY_ROOTS.notifications] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (unreadOnly = false) => [...notificationKeys.lists(), { unreadOnly }] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};
