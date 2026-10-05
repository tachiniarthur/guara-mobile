import type {
  AccountId,
  BankAccountType,
  CategoryId,
  Cents,
  IsoDate,
  IsoDateTime,
  SubcategoryId,
  Transaction,
  TransactionId,
  TransactionSummary,
  UnusualReason,
  UnusualStatus,
  YearMonth,
} from '@guara/types';
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
  id: CategoryId;
  name: string;
  count: number;
  total: Cents;
  color: string;
}

export const CATEGORY_TOTALS: CategoryTotal[] = [
  {
    id: 'housing',
    name: 'Moradia',
    count: 1,
    total: cents(210_000),
    color: colors.info.DEFAULT,
  },
  {
    id: 'electronics',
    name: 'Eletrônicos',
    count: 1,
    total: cents(124_990),
    color: colors.negative.DEFAULT,
  },
  {
    id: 'food',
    name: 'Alimentação',
    count: 31,
    total: cents(74_218),
    color: colors.brand.DEFAULT,
  },
  {
    id: 'transport',
    name: 'Transporte',
    count: 22,
    total: cents(38_640),
    color: colors.positive.DEFAULT,
  },
  {
    id: 'subscriptions',
    name: 'Assinaturas',
    count: 4,
    total: cents(10_160),
    color: colors.foreground.subtle,
  },
];

export interface BudgetWithMilestones {
  category: string;
  spent: Cents;
  limit: Cents;
  milestones: Cents[];
}

export interface CategoryBudget extends BudgetWithMilestones {
  categoryId: CategoryId;
}

/** `spent` is the API's figure before the edits made in the app (see `lib/ledger`). */
export const MONTH_BUDGETS: CategoryBudget[] = [
  {
    categoryId: 'food',
    category: 'Alimentação',
    spent: cents(74_218),
    limit: cents(100_000),
    milestones: [cents(50_000), cents(70_000)],
  },
  {
    categoryId: 'transport',
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

// --- Lançamentos ------------------------------------------------------------------------------

/** "Today" of the design snapshot: day labels ("Hoje", "Ontem") are relative to it. */
export const SPENDING_TODAY: IsoDate = '2026-09-23';
export const SPENDING_MONTH: YearMonth = '2026-09';

export interface LedgerAccount {
  bank: Exclude<SpendingBankId, 'all'>;
  type: BankAccountType;
}

export const LEDGER_ACCOUNTS: Record<string, LedgerAccount> = {
  'acc-nubank-card': { bank: 'nubank', type: 'credit_card' },
  'acc-itau-checking': { bank: 'itau', type: 'checking' },
};

/** A transaction as the API returns it (timestamps left out until the API exists). */
export type LedgerTransaction = Omit<Transaction, 'createdAt' | 'updatedAt'>;

interface LedgerInput {
  id: string;
  account: keyof typeof LEDGER_ACCOUNTS;
  amount: number;
  direction?: 'in' | 'out';
  type: LedgerTransaction['type'];
  date: IsoDate;
  occurredAt?: IsoDateTime;
  description: string;
  merchantName?: string;
  categoryId: CategoryId;
  subcategoryId?: SubcategoryId;
  invoice?: LedgerTransaction['invoice'];
  isUnusual?: boolean;
}

function ledger(input: LedgerInput): LedgerTransaction {
  return {
    id: input.id as TransactionId,
    accountId: input.account as AccountId,
    amount: cents(input.amount),
    currency: 'BRL',
    direction: input.direction ?? 'out',
    type: input.type,
    source: 'open_finance',
    date: input.date,
    occurredAt: input.occurredAt ?? null,
    description: input.description,
    merchantName: input.merchantName ?? null,
    autoCategoryId: input.categoryId,
    userCategoryId: null,
    categoryId: input.categoryId,
    subcategoryId: input.subcategoryId ?? null,
    installment: null,
    invoice: input.invoice ?? null,
    isUnusual: input.isUnusual ?? false,
    markedDuplicate: false,
    hiddenFromReports: false,
    note: null,
  };
}

const NUBANK = 'acc-nubank-card';
const ITAU = 'acc-itau-checking';

/** September transactions shown in the design ("Todos os lançamentos" and Alimentação). */
export const LEDGER: LedgerTransaction[] = [
  ledger({
    id: 'tx-eletronicos',
    account: NUBANK,
    amount: 124_990,
    type: 'credit_card',
    date: '2026-09-23',
    occurredAt: '2026-09-23T05:14:00.000Z',
    description: 'LOJAELETRON*ONLINE SP',
    merchantName: 'Loja de eletrônicos online',
    categoryId: 'electronics',
    invoice: { month: '2026-10', dueOn: '2026-10-10' },
    isUnusual: true,
  }),
  ledger({
    id: 'tx-cafe',
    account: NUBANK,
    amount: 950,
    type: 'credit_card',
    date: '2026-09-23',
    occurredAt: '2026-09-23T11:40:00.000Z',
    description: 'Café da esquina',
    categoryId: 'food',
    subcategoryId: 'bakery',
  }),
  ledger({
    id: 'tx-casa-bela',
    account: NUBANK,
    amount: 22_000,
    type: 'credit_card',
    date: '2026-09-22',
    description: 'Presentes Casa Bela',
    categoryId: 'shopping',
  }),
  ledger({
    id: 'tx-sabor-da-vila',
    account: NUBANK,
    amount: 16_310,
    type: 'credit_card',
    date: '2026-09-22',
    description: 'Restaurante Sabor da Vila',
    categoryId: 'food',
    subcategoryId: 'restaurants',
  }),
  ledger({
    id: 'tx-farmacia',
    account: ITAU,
    amount: 8_760,
    type: 'debit_card',
    date: '2026-09-22',
    description: 'Farmácia Bem Estar',
    categoryId: 'health',
  }),
  ledger({
    id: 'tx-app',
    account: NUBANK,
    amount: 2_390,
    type: 'credit_card',
    date: '2026-09-22',
    description: 'Transporte por app',
    categoryId: 'transport',
  }),
  ledger({
    id: 'tx-padaria',
    account: ITAU,
    amount: 1_840,
    type: 'debit_card',
    date: '2026-09-22',
    description: 'Padaria Central',
    categoryId: 'food',
    subcategoryId: 'bakery',
  }),
  ledger({
    id: 'tx-pizza',
    account: NUBANK,
    amount: 7_290,
    type: 'credit_card',
    date: '2026-09-21',
    description: 'Delivery de pizza',
    categoryId: 'food',
    subcategoryId: 'restaurants',
  }),
  ledger({
    id: 'tx-cinema',
    account: NUBANK,
    amount: 5_600,
    type: 'credit_card',
    date: '2026-09-21',
    description: 'Cine Max',
    categoryId: 'leisure',
  }),
  ledger({
    id: 'tx-app-21',
    account: NUBANK,
    amount: 3_720,
    type: 'credit_card',
    date: '2026-09-21',
    description: 'Transporte por app',
    categoryId: 'transport',
  }),
  ledger({
    id: 'tx-bar',
    account: NUBANK,
    amount: 8_800,
    type: 'credit_card',
    date: '2026-09-20',
    description: 'Bar do Zé',
    categoryId: 'leisure',
  }),
  ledger({
    id: 'tx-mercado-bairro',
    account: ITAU,
    amount: 7_410,
    type: 'debit_card',
    date: '2026-09-20',
    description: 'Mercado do bairro',
    categoryId: 'food',
    subcategoryId: 'groceries',
  }),
  ledger({
    id: 'tx-app-20',
    account: NUBANK,
    amount: 3_630,
    type: 'credit_card',
    date: '2026-09-20',
    description: 'Transporte por app',
    categoryId: 'transport',
  }),
  ledger({
    id: 'tx-japones',
    account: NUBANK,
    amount: 9_572,
    type: 'credit_card',
    date: '2026-09-19',
    description: 'Delivery japonês',
    categoryId: 'food',
    subcategoryId: 'restaurants',
  }),
  ledger({
    id: 'tx-hamburgueria',
    account: NUBANK,
    amount: 5_890,
    type: 'credit_card',
    date: '2026-09-19',
    description: 'Hamburgueria',
    categoryId: 'food',
    subcategoryId: 'restaurants',
  }),
  ledger({
    id: 'tx-freela',
    account: ITAU,
    amount: 100_000,
    direction: 'in',
    type: 'pix',
    date: '2026-09-18',
    description: 'Freela · site institucional',
    categoryId: 'other_income',
  }),
  ledger({
    id: 'tx-posto',
    account: ITAU,
    amount: 9_230,
    type: 'debit_card',
    date: '2026-09-18',
    description: 'Posto de combustível',
    categoryId: 'transport',
  }),
  ledger({
    id: 'tx-mercado',
    account: ITAU,
    amount: 31_120,
    type: 'debit_card',
    date: '2026-09-10',
    description: 'Mercado do mês',
    categoryId: 'food',
    subcategoryId: 'groceries',
  }),
];

/** Purchases out of the pattern and what the Quero-quero noticed. */
export const UNUSUAL: Record<string, { reasons: UnusualReason[]; status: UnusualStatus }> = {
  'tx-eletronicos': { reasons: ['unusual_amount', 'unusual_time'], status: 'pending' },
};

/** Month header from the API. Per-bank figures are not in the design: `null` shows "—". */
export const TRANSACTION_SUMMARIES: Record<SpendingBankId, TransactionSummary | null> = {
  all: {
    count: SPENDING.transactionsCount,
    totalIn: cents(820_000),
    totalOut: SPENDING.totalOut,
  },
  nubank: null,
  itau: null,
};

/** Category history the API sends beyond the month totals (only Alimentação in the design). */
export const CATEGORY_DETAILS: Partial<
  Record<
    CategoryId,
    {
      previousMonthSpent: Cents | null;
      projectedSpent: Cents | null;
      subcategories: { id: SubcategoryId; spent: Cents; count: number }[];
    }
  >
> = {
  food: {
    previousMonthSpent: cents(66_200),
    projectedSpent: cents(96_000),
    subcategories: [
      { id: 'restaurants', spent: cents(39_852), count: 14 },
      { id: 'groceries', spent: cents(27_148), count: 6 },
      { id: 'bakery', spent: cents(7_218), count: 11 },
    ],
  },
};

/** Last sync of each bank; `staleSince` set when a bank stopped updating. */
export const BANK_SYNC: { bank: Exclude<SpendingBankId, 'all'>; staleSince: IsoDateTime | null }[] =
  [
    { bank: 'nubank', staleSince: null },
    { bank: 'itau', staleSince: null },
  ];

/** Transactions in "Últimos lançamentos" of Gastos (design order). */
export const RECENT_TRANSACTION_IDS = [
  'tx-eletronicos',
  'tx-padaria',
  'tx-app',
  'tx-freela',
  'tx-mercado',
] as const;

/** Spotify appears in Gastos without account details, so it stays outside the ledger. */
export const RECENT_SUBSCRIPTION_ROW = {
  id: 'tx-spotify',
  name: 'Spotify',
  detail: '02 set · assinatura',
  category: 'Assinaturas',
  amount: cents(-2_190),
} as const;
