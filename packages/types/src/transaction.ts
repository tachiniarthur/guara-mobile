import type { Entity, ISODate } from './common';
import type { Cents, Currency } from './money';

export type TransactionDirection = 'debit' | 'credit';

export type TransactionSource = 'open_finance' | 'manual';

export interface Transaction extends Entity {
  accountId: string;
  description: string;
  /** Always positive; use `direction` for the sign. */
  amount: Cents;
  currency: Currency;
  direction: TransactionDirection;
  date: ISODate;
  categoryId: string | null;
  source: TransactionSource;
  /** "3/10" style installment info for credit card purchases. */
  installment: { current: number; total: number } | null;
  /** Set when the API suspects this is a duplicate of another transaction. */
  possibleDuplicateOf: string | null;
}

/** How the user chose to resolve a suspected duplicate. */
export type DuplicateResolution = 'merge' | 'keep_both' | 'delete_one';
