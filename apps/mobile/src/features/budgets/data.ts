import type { BudgetNotice, Cents, CategoryId, NotificationChannel, YearMonth } from '@guara/types';
import { cents } from '@guara/utils';

/** Tetos as shown in the design (static until the API exists). */
export const BUDGET_CATEGORIES = [
  { value: 'food', label: 'Alimentação' },
  { value: 'transport', label: 'Transporte' },
  { value: 'leisure', label: 'Lazer' },
  { value: 'subscriptions', label: 'Assinaturas' },
  { value: 'housing', label: 'Moradia' },
] as const;

export const BUDGET_PERIODS = [
  { value: 'monthly', label: 'Mensal, recomeça todo dia 1' },
  { value: 'weekly', label: 'Semanal, recomeça toda segunda' },
] as const;

export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number]['value'];
export type BudgetPeriod = (typeof BUDGET_PERIODS)[number]['value'];

/** What the user sets on a cap (`budgets.create` / `budgets.update`). */
export interface BudgetItem {
  id: string;
  categoryId: BudgetCategory;
  limit: Cents;
  /** Warnings before the cap, ascending and below it. */
  warnings: Cents[];
  period: BudgetPeriod;
  channels: NotificationChannel[];
}

export const BUDGETS: BudgetItem[] = [
  {
    id: 'budget-food',
    categoryId: 'food',
    limit: cents(100_000),
    warnings: [cents(50_000), cents(70_000)],
    period: 'monthly',
    channels: ['push', 'email'],
  },
  {
    id: 'budget-transport',
    categoryId: 'transport',
    limit: cents(45_000),
    warnings: [cents(30_000)],
    period: 'monthly',
    channels: ['push', 'email'],
  },
  {
    id: 'budget-leisure',
    categoryId: 'leisure',
    limit: cents(40_000),
    warnings: [cents(20_000), cents(30_000)],
    period: 'monthly',
    channels: ['push', 'email'],
  },
];

/**
 * What the API sends with each category this month: spent before the edits made in
 * Lançamentos, the projection at the current pace and the warnings already sent.
 */
export const BUDGET_MONTH: Partial<
  Record<CategoryId, { spent: Cents; projectedSpent: Cents | null; notices: BudgetNotice[] }>
> = {
  food: {
    spent: cents(74_218),
    projectedSpent: cents(96_000),
    notices: [
      { amount: cents(50_000), sentAt: '2026-09-12T16:48:00.000Z', channels: ['push'] },
      { amount: cents(70_000), sentAt: '2026-09-21T22:02:00.000Z', channels: ['push'] },
    ],
  },
  transport: {
    spent: cents(38_640),
    projectedSpent: cents(50_400),
    notices: [{ amount: cents(30_000), sentAt: '2026-09-17T11:41:00.000Z', channels: ['push'] }],
  },
  leisure: { spent: cents(12_000), projectedSpent: null, notices: [] },
};

/** Spent per month, oldest first; the last month is the current one (partial). */
export const CATEGORY_HISTORY: Partial<Record<CategoryId, { month: YearMonth; spent: Cents }[]>> = {
  food: [
    { month: '2026-04', spent: cents(79_000) },
    { month: '2026-05', spent: cents(86_000) },
    { month: '2026-06', spent: cents(88_000) },
    { month: '2026-07', spent: cents(102_000) },
    { month: '2026-08', spent: cents(83_000) },
    { month: '2026-09', spent: cents(74_218) },
  ],
};

/** "Meses anteriores": caps passed in each closed month. */
export const PAST_MONTHS: {
  month: YearMonth;
  exceeded: { categoryId: CategoryId; spent: Cents; limit: Cents }[];
}[] = [
  { month: '2026-08', exceeded: [] },
  {
    month: '2026-07',
    exceeded: [{ categoryId: 'food', spent: cents(102_000), limit: cents(100_000) }],
  },
];
