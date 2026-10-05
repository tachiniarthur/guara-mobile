import type { CategoryId, SubcategoryId } from '@guara/types';

/** pt-BR names of the categories (the contract keeps English ids). */
export const CATEGORY_LABELS: Record<CategoryId, string> = {
  housing: 'Moradia',
  bills: 'Contas da casa',
  food: 'Alimentação',
  transport: 'Transporte',
  health: 'Saúde',
  education: 'Educação',
  leisure: 'Lazer',
  shopping: 'Compras',
  electronics: 'Eletrônicos',
  home: 'Casa',
  subscriptions: 'Assinaturas',
  travel: 'Viagens',
  pets: 'Pets',
  personal_care: 'Cuidados pessoais',
  taxes: 'Impostos e taxas',
  transfers: 'Transferências',
  investments: 'Investimentos',
  salary: 'Salário',
  other_income: 'Entrada',
  other: 'Outros',
};

export const SUBCATEGORY_LABELS: Record<SubcategoryId, string> = {
  restaurants: 'Restaurantes e delivery',
  groceries: 'Mercado',
  bakery: 'Padaria e café',
};

/** Categories a purchase can be moved to, in the order of the "Outra…" list. */
export const EXPENSE_CATEGORIES: readonly CategoryId[] = [
  'food',
  'shopping',
  'electronics',
  'home',
  'leisure',
  'transport',
  'health',
  'housing',
  'bills',
  'subscriptions',
  'education',
  'travel',
  'pets',
  'personal_care',
  'taxes',
  'other',
];

export const INCOME_CATEGORIES: readonly CategoryId[] = ['salary', 'other_income', 'investments'];

/** Quick choices shown as chips before "Outra…" (design: Compras, Lazer, Casa). */
export const QUICK_CATEGORIES: readonly CategoryId[] = ['shopping', 'leisure', 'home', 'food'];

export function categoryLabel(id: CategoryId | null): string {
  return id ? CATEGORY_LABELS[id] : 'Sem categoria';
}
