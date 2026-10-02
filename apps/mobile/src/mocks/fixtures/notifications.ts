import { formatCents } from '@guara/utils';

import { addDays, instantAt } from '../clock';
import type { MockDb, NotificationRecord } from '../db';
import { buildBudget, currentMonth, today as todayOf } from '../logic/spending';

/** Read and unread notifications of every type, pointing at real scenario records. */
export function buildNotifications(db: MockDb): NotificationRecord[] {
  const today = todayOf(db);
  const at = (daysAgo: number, time: string) => instantAt(addDays(today, -daysAgo), time);
  const month = currentMonth(db);
  const budget = (categoryId: string) =>
    buildBudget(
      db,
      db.budgets.find((record) => record.categoryId === categoryId)!,
      month,
    );
  const txOf = (merchant: string) => db.transactions.find((tx) => tx.merchantName === merchant)!;
  const shopping = budget('shopping');
  const restaurants = budget('restaurants');
  const jewel = txOf('Joalheria Brilho Real');
  const vet = txOf('Clínica Veterinária Patas');
  const streamplus = db.subscriptions.find((sub) => sub.id === 'sub_streamplus')!;

  const list: NotificationRecord[] = [
    {
      id: 'ntf_consent',
      type: 'consent_expiring',
      title: 'Consentimento do Banco Jangada vence em 6 dias',
      body: 'Renove a conexão para continuar vendo seus lançamentos e saldos.',
      readAt: null,
      createdAt: at(0, '08:00'),
      link: '/account/banks/conn_jangada',
    },
    {
      id: 'ntf_budget_exceeded',
      type: 'budget_exceeded',
      title: 'Teto de Compras estourado',
      body: `Você já gastou ${formatCents(shopping.spent)} de ${formatCents(shopping.limit)} em Compras este mês.`,
      readAt: null,
      createdAt: jewel.createdAt,
      link: `/budgets/${shopping.id}`,
    },
    {
      id: 'ntf_unusual_jewel',
      type: 'unusual_transaction',
      title: 'Compra fora do padrão',
      body: `${formatCents(jewel.amount)} em ${jewel.merchantName}. Foi você?`,
      readAt: null,
      createdAt: jewel.createdAt,
      link: `/spending/${jewel.id}`,
    },
    {
      id: 'ntf_budget_warning',
      type: 'budget_warning',
      title: 'Restaurantes e delivery passou de 80%',
      body: `Faltam ${formatCents(Math.max(0, restaurants.limit - restaurants.spent))} para o teto do mês.`,
      readAt: null,
      createdAt: at(5, '19:30'),
      link: `/budgets/${restaurants.id}`,
    },
    {
      id: 'ntf_price_alert',
      type: 'price_alert',
      title: 'WEGE3 chegou ao seu preço de compra',
      body: `A ação foi negociada a ${formatCents(3_948)}, abaixo do alvo de ${formatCents(3_950)}.`,
      readAt: at(9, '12:10'),
      createdAt: at(9, '11:31'),
      link: '/price-alerts/alert_wege3_buy',
    },
    {
      id: 'ntf_subscription',
      type: 'subscription_price_increase',
      title: 'StreamPlus ficou mais cara',
      body: `A assinatura passou de ${formatCents(streamplus.priceIncrease!.previousAmount)} para ${formatCents(streamplus.amount)}.`,
      readAt: at(16, '20:00'),
      createdAt: instantAt(streamplus.priceIncrease!.changedOn, '09:00'),
      link: `/spending/subscriptions/${streamplus.id}`,
    },
    {
      id: 'ntf_unusual_vet',
      type: 'unusual_transaction',
      title: 'Compra fora do padrão',
      body: `${formatCents(vet.amount)} em ${vet.merchantName}. Foi você?`,
      readAt: vet.createdAt,
      createdAt: vet.createdAt,
      link: `/spending/${vet.id}`,
    },
    {
      id: 'ntf_report',
      type: 'report_ready',
      title: 'Seu relatório de agosto está pronto',
      body: 'Veja entradas, saídas e o que mais mexeu no seu saldo.',
      readAt: at(23, '07:45'),
      createdAt: at(24, '06:00'),
      link: '/reports',
    },
  ];
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
