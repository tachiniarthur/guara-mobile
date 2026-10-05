import type { AssistantId } from '@guara/types';
import { cents } from '@guara/utils';

import type { BudgetWithMilestones } from '@/features/spending';

/** Alertas as shown in the design (static until the API exists). */
export const ALERTS_SUBTITLE = '3 tetos e 3 alertas de preço';

export const ALERT_BUDGETS: BudgetWithMilestones[] = [
  {
    category: 'Alimentação',
    spent: cents(74_218),
    limit: cents(100_000),
    milestones: [cents(50_000), cents(70_000)],
  },
  {
    category: 'Transporte',
    spent: cents(38_640),
    limit: cents(45_000),
    milestones: [cents(30_000)],
  },
  {
    category: 'Lazer',
    spent: cents(12_000),
    limit: cents(40_000),
    milestones: [cents(20_000), cents(30_000)],
  },
];

export interface PriceAlertSummary {
  id: string;
  asset: string;
  side: 'buy' | 'sell';
  /** "Quando subir a R$ 650.000 · agora R$ 615.200". */
  condition: string;
  /** How close the price is to the target (0–100). */
  progress: number;
  remaining: string;
}

export const PRICE_ALERTS: PriceAlertSummary[] = [
  {
    id: 'btc',
    asset: 'Bitcoin',
    side: 'sell',
    condition: 'Quando subir a R$ 650.000 · agora R$ 615.200',
    progress: 95,
    remaining: 'Faltam 5,4%',
  },
  {
    id: 'petr4',
    asset: 'PETR4',
    side: 'buy',
    condition: 'Quando cair a R$ 34,00 · agora R$ 37,82',
    progress: 78,
    remaining: 'Faltam 10,1%',
  },
  {
    id: 'ivvb11',
    asset: 'IVVB11',
    side: 'buy',
    condition: 'Quando cair a R$ 330,00 · agora R$ 351,40',
    progress: 88,
    remaining: 'Faltam 6,1%',
  },
];

export interface NoticeHistoryItem {
  id: string;
  assistant: AssistantId;
  title: string;
  detail: string;
  pending?: boolean;
}

export const NOTICE_HISTORY: NoticeHistoryItem[] = [
  {
    id: 'n1',
    assistant: 'quero_quero',
    title: 'Compra fora do padrão: R$ 1.249,90 em eletrônicos',
    detail: 'Hoje, 02:15 · celular e e-mail',
    pending: true,
  },
  {
    id: 'n2',
    assistant: 'tamandua',
    title: 'Alimentação chegou a R$ 700 (2º de 3 avisos)',
    detail: '21 set, 19:02 · celular',
  },
  {
    id: 'n3',
    assistant: 'tamandua',
    title: 'Transporte chegou a R$ 300 (1º de 2 avisos)',
    detail: '17 set, 08:41 · celular',
  },
];
