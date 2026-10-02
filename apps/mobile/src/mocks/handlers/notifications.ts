import type { MockDb } from '../db';
import { notFound } from '../errors';
import { paginate, touch } from '../logic/records';

import type { MockHandlers } from './types';

export const notificationHandlers = {
  'notifications.list': ({ query }, { db }) =>
    paginate(
      db.notifications
        .filter((notification) => !query.unreadOnly || notification.readAt === null)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      query.cursor,
      query.limit,
    ),

  'notifications.unreadCount': (_request, { db }) => ({
    count: db.notifications.filter((notification) => notification.readAt === null).length,
  }),

  'notifications.markRead': ({ params }, { db }) => {
    const notification = db.notifications.find((item) => item.id === params.notificationId);
    if (!notification) throw notFound('Notificação não encontrada.');
    notification.readAt ??= touch(db);
    return notification;
  },

  'notifications.markAllRead': (_request, { db }) => {
    const unread = db.notifications.filter((notification) => notification.readAt === null);
    const readAt = touch(db);
    for (const notification of unread) notification.readAt = readAt;
    return { updated: unread.length };
  },
} satisfies Partial<MockHandlers<MockDb>>;
