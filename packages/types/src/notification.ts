import { z } from 'zod';

import { IsoDateTimeSchema } from './common';
import { NotificationIdSchema } from './ids';

export const NotificationChannelSchema = z.enum(['push', 'email']);
export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;

export const NotificationTypeSchema = z.enum([
  'budget_warning',
  'budget_exceeded',
  'price_alert',
  'unusual_transaction',
  'consent_expiring',
  'subscription_price_increase',
  'report_ready',
]);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const AppNotificationSchema = z.object({
  id: NotificationIdSchema,
  type: NotificationTypeSchema,
  /** pt-BR texts written by the API. */
  title: z.string().min(1),
  body: z.string(),
  /** `null` while unread. */
  readAt: IsoDateTimeSchema.nullable(),
  createdAt: IsoDateTimeSchema,
  /** Internal app path opened on tap, e.g. "/budgets/bud_1". */
  link: z.string().startsWith('/').nullable(),
});
export type AppNotification = z.infer<typeof AppNotificationSchema>;

export const UnreadCountSchema = z.object({ count: z.int().nonnegative() });
export type UnreadCount = z.infer<typeof UnreadCountSchema>;

const ChannelToggleSchema = z.object({ push: z.boolean(), email: z.boolean() });

/** Which channels deliver each notification type. */
export const NotificationPreferencesSchema = z.object({
  push: z.object({ enabled: z.boolean() }),
  email: z.object({ enabled: z.boolean(), address: z.email().nullable() }),
  byType: z.record(NotificationTypeSchema, ChannelToggleSchema),
});
export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;
