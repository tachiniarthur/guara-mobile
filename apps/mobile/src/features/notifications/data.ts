import type { AppNotification, IsoDate, IsoDateTime, NotificationType } from '@guara/types';
import type { Href } from 'expo-router';

import type { IconName } from '@/components/ui';

/** "Hoje" of the design's notifications. */
export const NOTIFICATIONS_TODAY: IsoDate = '2026-09-23';

/** Filters of the list (the area of the app each notice belongs to). */
export type NotificationArea = 'spending' | 'investments' | 'account';

export const NOTIFICATION_FILTERS: { value: NotificationArea | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'spending', label: 'Gastos' },
  { value: 'investments', label: 'Investimentos' },
  { value: 'account', label: 'Conta' },
];

export type NotificationTone = 'negative' | 'brand' | 'info' | 'neutral';

/**
 * A notice of the notification center: the API's `AppNotification` (pt-BR texts) plus who sent
 * it and the button of the design. `createdAt` is `null` where the design shows no time.
 */
export interface NotificationItem extends Omit<
  AppNotification,
  'id' | 'createdAt' | 'link' | 'readAt'
> {
  id: string;
  createdAt: IsoDateTime | null;
  read: boolean;
  area: NotificationArea;
  /** "Quero-quero · Fora do padrão", "Conta · Bancos conectados". */
  source: string;
  icon: IconName;
  /** Icon tile while unread (read notices of past months turn neutral). */
  tone: NotificationTone;
  action: { label: string; href: Href } | null;
}

const TYPE_AREA: Record<NotificationType, NotificationArea> = {
  budget_warning: 'spending',
  budget_exceeded: 'spending',
  unusual_transaction: 'spending',
  subscription_price_increase: 'spending',
  price_alert: 'investments',
  consent_expiring: 'account',
  report_ready: 'account',
};

const notification = (input: Omit<NotificationItem, 'area'>): NotificationItem => ({
  ...input,
  area: TYPE_AREA[input.type],
});

/** Notices of the design, newest first. */
export const NOTIFICATIONS: NotificationItem[] = [
  notification({
    id: 'ntf-unusual-eletronicos',
    type: 'unusual_transaction',
    title: 'Compra de R$ 1.249,90 às 02:14',
    body: 'Loja de eletrônicos · 3,8x sua média',
    source: 'Quero-quero · Fora do padrão',
    createdAt: '2026-09-23T05:15:00.000Z',
    icon: 'alertTriangle',
    tone: 'negative',
    action: {
      label: 'Revisar',
      href: { pathname: '/spending/[transactionId]', params: { transactionId: 'tx-eletronicos' } },
    },
    read: false,
  }),
  notification({
    id: 'ntf-budget-transport-86',
    type: 'budget_warning',
    title: 'Transporte chegou a 86% do teto',
    body: 'Faltam R$ 63,60 até o limite do mês',
    source: 'Tamanduá · Gastos',
    createdAt: null,
    icon: 'target',
    tone: 'brand',
    action: { label: 'Ver', href: '/alerts' },
    read: false,
  }),
  notification({
    id: 'ntf-netflix-price',
    type: 'subscription_price_increase',
    title: 'Netflix subiu R$ 5,00',
    body: 'Próxima cobrança de R$ 44,90 em 8 de outubro',
    source: 'Tamanduá · Gastos',
    createdAt: null,
    icon: 'repeat',
    tone: 'brand',
    action: { label: 'Ver', href: '/spending/subscriptions' },
    read: false,
  }),
  notification({
    id: 'ntf-itau-consent',
    type: 'consent_expiring',
    title: 'Itaú: a autorização termina em 26 de outubro',
    body: 'Depois disso, gastos e saldo do Itaú param de atualizar',
    source: 'Conta · Bancos conectados',
    createdAt: null,
    icon: 'bank',
    tone: 'info',
    action: {
      label: 'Renovar',
      href: { pathname: '/malvo/[bankId]', params: { bankId: 'itau', mode: 'renew' } },
    },
    read: true,
  }),
  notification({
    id: 'ntf-budget-food-700',
    type: 'budget_warning',
    title: 'Alimentação chegou a R$ 700 (2º de 3 avisos)',
    body: 'Teto de R$ 1.000',
    source: 'Tamanduá · Gastos',
    createdAt: '2026-09-21T22:02:00.000Z',
    icon: 'target',
    tone: 'neutral',
    action: null,
    read: true,
  }),
  notification({
    id: 'ntf-budget-transport-300',
    type: 'budget_warning',
    title: 'Transporte chegou a R$ 300 (1º de 2 avisos)',
    body: 'Teto de R$ 450',
    source: 'Tamanduá · Gastos',
    createdAt: '2026-09-17T11:41:00.000Z',
    icon: 'target',
    tone: 'neutral',
    action: null,
    read: true,
  }),
  notification({
    id: 'ntf-budget-food-500',
    type: 'budget_warning',
    title: 'Alimentação chegou a R$ 500 (1º de 3 avisos)',
    body: 'Teto de R$ 1.000',
    source: 'Tamanduá · Gastos',
    createdAt: '2026-09-12T16:48:00.000Z',
    icon: 'target',
    tone: 'neutral',
    action: null,
    read: true,
  }),
];
