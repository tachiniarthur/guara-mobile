import type { CategoryId, CategoryKind } from '@guara/types';

import type { MockDb } from '../db';

/** Fixed category list, as the API will serve it (labels in pt-BR, lucide icon names). */
export const CATEGORIES: MockDb['categories'] = [
  { id: 'housing', label: 'Moradia', icon: 'house', kind: 'expense' },
  { id: 'bills', label: 'Contas da casa', icon: 'receipt', kind: 'expense' },
  { id: 'groceries', label: 'Mercado', icon: 'shopping-cart', kind: 'expense' },
  { id: 'restaurants', label: 'Restaurantes e delivery', icon: 'utensils', kind: 'expense' },
  { id: 'transport', label: 'Transporte', icon: 'car', kind: 'expense' },
  { id: 'health', label: 'Saúde', icon: 'heart-pulse', kind: 'expense' },
  { id: 'education', label: 'Educação', icon: 'graduation-cap', kind: 'expense' },
  { id: 'leisure', label: 'Lazer', icon: 'ticket', kind: 'expense' },
  { id: 'shopping', label: 'Compras', icon: 'shopping-bag', kind: 'expense' },
  { id: 'subscriptions', label: 'Assinaturas', icon: 'repeat', kind: 'expense' },
  { id: 'travel', label: 'Viagens', icon: 'plane', kind: 'expense' },
  { id: 'pets', label: 'Pets', icon: 'paw-print', kind: 'expense' },
  { id: 'personal_care', label: 'Cuidados pessoais', icon: 'sparkles', kind: 'expense' },
  { id: 'taxes', label: 'Impostos e taxas', icon: 'landmark', kind: 'expense' },
  { id: 'transfers', label: 'Transferências', icon: 'arrow-left-right', kind: 'transfer' },
  { id: 'investments', label: 'Investimentos', icon: 'trending-up', kind: 'transfer' },
  { id: 'salary', label: 'Salário', icon: 'wallet', kind: 'income' },
  { id: 'other_income', label: 'Outras entradas', icon: 'circle-plus', kind: 'income' },
  { id: 'other', label: 'Outros', icon: 'circle-ellipsis', kind: 'expense' },
];

const KIND = new Map(CATEGORIES.map((category) => [category.id, category.kind]));

export function categoryKind(id: CategoryId | null): CategoryKind {
  return id ? (KIND.get(id) ?? 'expense') : 'expense';
}

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((category) => category.id === id)?.label ?? id;
}
