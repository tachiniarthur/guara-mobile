import type { Entity, ISODateTime } from './common';

export type NotificationChannel = 'push' | 'email';

export type NotificationType =
  | 'budget_warning'
  | 'budget_exceeded'
  | 'price_alert'
  | 'unusual_purchase'
  | 'goal_progress'
  | 'bank_consent_expiring'
  | 'subscription_charge'
  | 'system';

export interface AppNotification extends Entity {
  type: NotificationType;
  title: string;
  body: string;
  readAt: ISODateTime | null;
  /** Deep link handled by Expo Router, e.g. "guara://budgets/123". */
  url: string | null;
}

export type NotificationPreferences = Record<NotificationType, NotificationChannel[]>;
