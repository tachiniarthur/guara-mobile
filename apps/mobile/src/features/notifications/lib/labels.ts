import type { IsoDate } from '@guara/types';
import { formatDate, formatTime, toISODate } from '@guara/utils';

import type { NoticeChannel } from '@/stores/ui-preferences';

import type { NotificationItem } from '../data';

/** "Hoje, 02:15" or "21 set, 19:02" (São Paulo time). */
export function notificationTime(createdAt: string, today: IsoDate): string {
  if (toISODate(createdAt) === today) return `Hoje, ${formatTime(createdAt)}`;
  return `${formatDate(createdAt, 'd MMM').replace('.', '')}, ${formatTime(createdAt)}`;
}

/** "Quero-quero · Fora do padrão · Hoje, 02:15". */
export function notificationMeta(item: NotificationItem, today: IsoDate): string {
  return item.createdAt
    ? `${item.source} · ${notificationTime(item.createdAt, today)}`
    : item.source;
}

/** "Celular e e-mail", "Celular", "E-mail" or "Desligado". */
export function channelsLabel(channels: Record<NoticeChannel, boolean>): string {
  if (channels.push && channels.email) return 'Celular e e-mail';
  if (channels.push) return 'Celular';
  if (channels.email) return 'E-mail';
  return 'Desligado';
}

/** "Notificações, 3 novas" for the bell buttons. */
export function bellLabel(unread: number): string {
  if (unread === 0) return 'Notificações';
  return `Notificações, ${unread} ${unread === 1 ? 'nova' : 'novas'}`;
}
