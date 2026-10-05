import type { AssistantId, Cents } from '@guara/types';
import { cents } from '@guara/utils';

/**
 * Início as shown in the design (static until the API exists). Money in integer cents.
 */
export const HOME = {
  greeting: 'Boa tarde, Arthur.',
  dateLabel: 'Quarta, 23 de setembro',
  pendingCount: 3,
  monthShort: 'Set 2026',
  monthLong: 'Setembro 2026',
  monthName: 'setembro',
  updatedLabel: 'Atualizado há 5 min · 2 de 3 bancos',
  balance: {
    label: 'Saldo em 2 bancos',
    value: cents(1_248_032),
    inflow: cents(820_000),
    inflowDelta: '+4% vs agosto',
    outflow: cents(591_247),
    outflowDelta: '−6% vs agosto',
    left: cents(228_753),
    leftDelta: '+R$ 697 vs agosto',
  },
} as const;

/** Cumulative money in/out for days 1–23 of September (the cashflow chart). */
export const CASHFLOW = {
  daysInMonth: 30,
  maxValue: cents(900_000),
  inflow: [0, 0, 0, 0, 720_000, ...Array(12).fill(720_000), ...Array(6).fill(820_000)].map(cents),
  outflow: [
    4_300, 12_900, 16_400, 28_600, 238_600, 245_000, 266_400, 270_700, 274_300, 305_700, 311_400,
    320_700, 338_600, 362_900, 368_600, 370_700, 377_900, 390_700, 401_400, 410_000, 415_000,
    420_000, 591_247,
  ].map(cents),
  outflowForecast: cents(605_000),
  accessibilityLabel:
    'Entradas e saídas acumuladas em setembro. Entrou R$ 8.200 e saiu R$ 5.912 até hoje; sobraram R$ 2.287. Previsão de saídas no fim do mês: cerca de R$ 6.050.',
} as const;

export interface AttentionItemData {
  id: string;
  assistant: AssistantId;
  title: string;
  detail: string;
  /** "Quero-quero · Fora do padrão". */
  source: string;
  urgent: boolean;
  action: string;
}

export const ATTENTION_ITEMS: AttentionItemData[] = [
  {
    id: 'unusual-purchase',
    assistant: 'quero_quero',
    title: 'Compra de R$ 1.249,90 às 02:14',
    detail: 'Loja de eletrônicos · 3,8x sua média',
    source: 'Quero-quero · Fora do padrão',
    urgent: true,
    action: 'Revisar',
  },
  {
    id: 'transport-budget',
    assistant: 'tamandua',
    title: 'Transporte chegou a 86% do teto',
    detail: 'Faltam R$ 63,60 até o limite do mês',
    source: 'Tamanduá · Gastos',
    urgent: false,
    action: 'Ver',
  },
  {
    id: 'netflix-raise',
    assistant: 'tamandua',
    title: 'Netflix subiu R$ 5,00',
    detail: 'Próxima cobrança de R$ 44,90 em 8 de outubro',
    source: 'Tamanduá · Gastos',
    urgent: false,
    action: 'Ver',
  },
];

export interface BudgetSummary {
  category: string;
  spent: Cents;
  limit: Cents;
}

export const BUDGETS: BudgetSummary[] = [
  { category: 'Alimentação', spent: cents(74_218), limit: cents(100_000) },
  { category: 'Transporte', spent: cents(38_640), limit: cents(45_000) },
  { category: 'Lazer', spent: cents(12_000), limit: cents(40_000) },
  { category: 'Assinaturas', spent: cents(10_200), limit: cents(15_000) },
];

export interface RecentTransaction {
  id: string;
  merchant: string;
  /** "Alimentação · Ontem"; omitted when the row is flagged. */
  detail: string;
  amount: Cents;
  direction: 'in' | 'out';
  /** Out of the user's pattern (Quero-quero). */
  flagged?: boolean;
}

export const RECENT_TRANSACTIONS: RecentTransaction[] = [
  {
    id: 'tx-eletronicos',
    merchant: 'Loja de eletrônicos',
    detail: 'Fora do padrão',
    amount: cents(124_990),
    direction: 'out',
    flagged: true,
  },
  {
    id: 'tx-padaria',
    merchant: 'Padaria',
    detail: 'Alimentação · Ontem',
    amount: cents(1_840),
    direction: 'out',
  },
  {
    id: 'tx-app-carro',
    merchant: 'App de carro',
    detail: 'Transporte · Ontem',
    amount: cents(2_390),
    direction: 'out',
  },
  {
    id: 'tx-freela',
    merchant: 'Freela',
    detail: 'Entrada · 18 set',
    amount: cents(100_000),
    direction: 'in',
  },
];

export const TRANSACTIONS_COUNT = 118;
