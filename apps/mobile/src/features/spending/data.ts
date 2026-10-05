import type { Cents } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { cents } from '@guara/utils';

/** Gastos as shown in the design (static until the API exists). */
export const SPENDING = {
  monthShort: 'Set 2026',
  subtitle: 'Setembro · 118 lançamentos',
  transactionsCount: 118,
  totalOut: cents(591_247),
  othersTotal: cents(133_239),
} as const;

export const SPENDING_BANKS = [
  { id: 'all', label: 'Todos os bancos' },
  { id: 'nubank', label: 'Nubank' },
  { id: 'itau', label: 'Itaú' },
] as const;

export type SpendingBankId = (typeof SPENDING_BANKS)[number]['id'];

/** Cumulative spending per day (reais): September up to day 23, August complete. */
export const PACE = {
  september: [
    62, 118, 171, 236, 2412, 2468, 2540, 2601, 2655, 3012, 3070, 3145, 3210, 3268, 3342, 3415, 3486,
    3560, 3640, 4378, 4455, 4590, 5912,
  ],
  august: [
    48, 101, 160, 210, 2385, 2440, 2505, 2570, 2630, 2960, 3030, 3095, 3170, 3240, 3320, 3390, 3455,
    3530, 3610, 4290, 4360, 4420, 4900, 4990, 5260, 5340, 5430, 5560, 5710, 6120, 6290,
  ],
  daysInMonth: 31,
  accessibilityLabel:
    'Gasto acumulado dia a dia. Setembro: R$ 5.912 até o dia 23. Agosto, no mesmo dia: R$ 4.900; fechou em R$ 6.290.',
} as const;

export const MONTHLY_TOTALS = {
  bars: [
    { label: 'abr', value: 5480, description: 'Abr: R$ 5.480' },
    { label: 'mai', value: 5120, description: 'Mai: R$ 5.120' },
    { label: 'jun', value: 5760, description: 'Jun: R$ 5.760' },
    { label: 'jul', value: 6410, description: 'Jul: R$ 6.410', valueLabel: 'R$ 6.410' },
    { label: 'ago', value: 6290, description: 'Ago: R$ 6.290' },
    {
      label: 'set',
      value: 5912,
      forecast: 6050,
      highlight: true,
      valueLabel: 'R$ 5.912',
      description: 'Set: R$ 5.912 até o dia 23 · previsão de R$ 6.050',
    },
  ],
  average: { value: 5812, label: 'média R$ 5.812' },
  accessibilityLabel:
    'Gasto por mês: abril R$ 5.480, maio R$ 5.120, junho R$ 5.760, julho R$ 6.410, agosto R$ 6.290, setembro R$ 5.912 até o dia 23, previsão R$ 6.050. Média de abril a agosto R$ 5.812.',
} as const;

export const WEEKDAY_AVERAGES = {
  bars: [
    { label: 'dom', value: 138, description: 'Dom: R$ 138 por dia, em média' },
    { label: 'seg', value: 96, description: 'Seg: R$ 96 por dia, em média' },
    { label: 'ter', value: 84, description: 'Ter: R$ 84 por dia, em média' },
    { label: 'qua', value: 102, description: 'Qua: R$ 102 por dia, em média' },
    { label: 'qui', value: 118, description: 'Qui: R$ 118 por dia, em média' },
    {
      label: 'sex',
      value: 196,
      highlight: true,
      valueLabel: 'R$ 196',
      description: 'Sex: R$ 196 por dia, em média',
    },
    {
      label: 'sáb',
      value: 214,
      highlight: true,
      valueLabel: 'R$ 214',
      description: 'Sáb: R$ 214 por dia, em média',
    },
  ],
  accessibilityLabel:
    'Gasto médio por dia da semana: domingo R$ 138, segunda R$ 96, terça R$ 84, quarta R$ 102, quinta R$ 118, sexta R$ 196, sábado R$ 214.',
} as const;

export interface CategoryTotal {
  name: string;
  count: number;
  total: Cents;
  share: number;
  color: string;
}

export const CATEGORY_TOTALS: CategoryTotal[] = [
  { name: 'Moradia', count: 1, total: cents(210_000), share: 36, color: colors.info.DEFAULT },
  {
    name: 'Eletrônicos',
    count: 1,
    total: cents(124_990),
    share: 21,
    color: colors.negative.DEFAULT,
  },
  { name: 'Alimentação', count: 31, total: cents(74_218), share: 13, color: colors.brand.DEFAULT },
  { name: 'Transporte', count: 22, total: cents(38_640), share: 7, color: colors.positive.DEFAULT },
  {
    name: 'Assinaturas',
    count: 4,
    total: cents(10_160),
    share: 2,
    color: colors.foreground.subtle,
  },
];

export interface BudgetWithMilestones {
  category: string;
  spent: Cents;
  limit: Cents;
  milestones: Cents[];
}

export const MONTH_BUDGETS: BudgetWithMilestones[] = [
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
];

export interface SubscriptionSummary {
  id: string;
  name: string;
  next: string;
  amount: Cents;
}

export const ACTIVE_SUBSCRIPTIONS: SubscriptionSummary[] = [
  { id: 'spotify', name: 'Spotify', next: 'próxima em 02/out', amount: cents(2_190) },
  { id: 'netflix', name: 'Netflix', next: 'próxima em 08/out', amount: cents(4_490) },
  { id: 'prime', name: 'Amazon Prime', next: 'próxima em 12/out', amount: cents(1_990) },
];

export const SUBSCRIPTIONS_SUMMARY = '4 detectadas automaticamente · R$ 101,60/mês';

export interface SpendingTransaction {
  id: string;
  description: string;
  /** "Hoje, 02:14 · Nubank crédito". */
  detail: string;
  category: string;
  amount: Cents;
  direction: 'in' | 'out';
  flagged?: boolean;
}

export const TRANSACTIONS: SpendingTransaction[] = [
  {
    id: 'tx-eletronicos',
    description: 'Loja de eletrônicos online',
    detail: 'Hoje, 02:14 · Nubank crédito',
    category: 'Eletrônicos',
    amount: cents(124_990),
    direction: 'out',
    flagged: true,
  },
  {
    id: 'tx-padaria',
    description: 'Padaria Central',
    detail: 'Ontem · Itaú débito',
    category: 'Alimentação',
    amount: cents(1_840),
    direction: 'out',
  },
  {
    id: 'tx-app',
    description: 'Transporte por app',
    detail: 'Ontem · Nubank crédito',
    category: 'Transporte',
    amount: cents(2_390),
    direction: 'out',
  },
  {
    id: 'tx-freela',
    description: 'Freela · site institucional',
    detail: '18 set · Pix recebido · Itaú',
    category: 'Entrada',
    amount: cents(100_000),
    direction: 'in',
  },
  {
    id: 'tx-mercado',
    description: 'Mercado do mês',
    detail: '10 set · Itaú débito',
    category: 'Alimentação',
    amount: cents(31_120),
    direction: 'out',
  },
  {
    id: 'tx-spotify',
    description: 'Spotify',
    detail: '02 set · assinatura',
    category: 'Assinaturas',
    amount: cents(2_190),
    direction: 'out',
  },
];
