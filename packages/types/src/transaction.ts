import { z } from 'zod';

import { CategoryIdSchema } from './category';
import {
  CursorQuerySchema,
  IsoDateSchema,
  IsoDateTimeSchema,
  PeriodQuerySchema,
  timestamps,
} from './common';
import { AccountIdSchema, TransactionIdSchema } from './ids';
import { CurrencySchema, PositiveCentsSchema } from './money';

export const TransactionDirectionSchema = z.enum(['in', 'out']);
export type TransactionDirection = z.infer<typeof TransactionDirectionSchema>;

/** Payment method reported by the institution. */
export const TransactionTypeSchema = z.enum([
  'pix',
  'debit_card',
  'credit_card',
  'boleto',
  'transfer',
  'direct_debit',
  'fee',
  'other',
]);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const InstallmentSchema = z
  .object({ current: z.int().positive(), total: z.int().min(2) })
  .refine(({ current, total }) => current <= total, { message: 'current must be ≤ total' });
export type Installment = z.infer<typeof InstallmentSchema>;

export const TransactionSchema = z
  .object({
    id: TransactionIdSchema,
    accountId: AccountIdSchema,
    /** Always positive; the sign comes from `direction`. */
    amount: PositiveCentsSchema,
    currency: CurrencySchema,
    direction: TransactionDirectionSchema,
    type: TransactionTypeSchema,
    /** Booking date (São Paulo calendar day). */
    date: IsoDateSchema,
    /** Exact instant, when the institution reports it. */
    occurredAt: IsoDateTimeSchema.nullable(),
    /** Raw description from the bank statement. */
    description: z.string().min(1),
    /** Cleaned-up merchant name, when recognised. */
    merchantName: z.string().min(1).nullable(),
    /** Category assigned by the API's classifier. */
    autoCategoryId: CategoryIdSchema.nullable(),
    /** Category chosen by the user; wins over the automatic one. */
    userCategoryId: CategoryIdSchema.nullable(),
    /** Effective category: `userCategoryId ?? autoCategoryId`. */
    categoryId: CategoryIdSchema.nullable(),
    /** "3/10" for credit card installments. */
    installment: InstallmentSchema.nullable(),
    /** Flagged as out of the user's usual pattern (see `UnusualTransaction`). */
    isUnusual: z.boolean(),
    ...timestamps,
  })
  .refine((tx) => tx.categoryId === (tx.userCategoryId ?? tx.autoCategoryId), {
    message: 'categoryId must equal userCategoryId ?? autoCategoryId',
    path: ['categoryId'],
  });
export type Transaction = z.infer<typeof TransactionSchema>;

export const TransactionListQuerySchema = z.object({
  ...CursorQuerySchema.shape,
  ...PeriodQuerySchema.shape,
  accountId: AccountIdSchema.optional(),
  categoryId: CategoryIdSchema.optional(),
  direction: TransactionDirectionSchema.optional(),
  /** Free text over description and merchant. */
  search: z.string().min(1).max(100).optional(),
  unusualOnly: z.boolean().optional(),
});
export type TransactionListQuery = z.infer<typeof TransactionListQuerySchema>;

export const CorrectCategoryBodySchema = z.object({
  categoryId: CategoryIdSchema,
  /** Also recategorise past and future transactions of the same merchant. */
  applyToSimilar: z.boolean().optional(),
});
export type CorrectCategoryBody = z.infer<typeof CorrectCategoryBodySchema>;
