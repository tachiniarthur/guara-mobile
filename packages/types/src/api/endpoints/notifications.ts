import { z } from 'zod';

import {
  AppNotificationSchema,
  CursorQuerySchema,
  NotificationIdSchema,
  UnreadCountSchema,
  paginated,
} from '../../domain';
import { defineEndpoints } from '../define';

/** In-app notification center. */
export const notificationEndpoints = defineEndpoints({
  'notifications.list': {
    method: 'GET',
    path: '/v1/notifications',
    summary: 'Notifications, newest first',
    query: CursorQuerySchema.extend({ unreadOnly: z.boolean().optional() }),
    response: paginated(AppNotificationSchema),
  },
  'notifications.unreadCount': {
    method: 'GET',
    path: '/v1/notifications/unread-count',
    summary: 'Badge counter',
    response: UnreadCountSchema,
  },
  'notifications.markRead': {
    method: 'POST',
    path: '/v1/notifications/:notificationId/read',
    summary: 'Mark one notification as read',
    params: z.object({ notificationId: NotificationIdSchema }),
    response: AppNotificationSchema,
  },
  'notifications.markAllRead': {
    method: 'POST',
    path: '/v1/notifications/read-all',
    summary: 'Mark every notification as read',
    response: z.object({ updated: z.int().nonnegative() }),
  },
});
