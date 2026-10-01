import type { Entity } from './common';

export type CategoryKind = 'expense' | 'income' | 'transfer';

export interface Category extends Entity {
  name: string;
  kind: CategoryKind;
  icon: string | null;
  color: string | null;
  parentId: string | null;
  isSystem: boolean;
}
