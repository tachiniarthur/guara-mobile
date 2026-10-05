import { cents } from '@guara/utils';

/** Novo teto as shown in the design (static until the API exists). */
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

/** Spent in the category this month (Alimentação). */
export const CATEGORY_SPENT = cents(74_218);
export const CATEGORY_AVERAGE = 910;

/** Category totals per month in whole reais (setembro até o dia 23). */
export const CATEGORY_HISTORY = [
  { label: 'abr', value: 790 },
  { label: 'mai', value: 860 },
  { label: 'jun', value: 880 },
  { label: 'jul', value: 1020 },
  { label: 'ago', value: 830 },
  { label: 'set*', value: 742 },
];

export const MONTH_NAMES: Record<string, string> = {
  abr: 'abril',
  mai: 'maio',
  jun: 'junho',
  jul: 'julho',
  ago: 'agosto',
  'set*': 'setembro',
};
