import { z } from 'zod';

import { BudgetStatusSchema } from './budget';
import { CategoryIdSchema, SUBCATEGORY_PARENT, SubcategoryIdSchema } from './category';
import {
  CursorQuerySchema,
  IsoDateSchema,
  IsoDateTimeSchema,
  PeriodQuerySchema,
  YearMonthSchema,
  timestamps,
} from './common';
import { AccountIdSchema, TransactionIdSchema } from './ids';
import { CurrencySchema, NonNegativeCentsSchema, PositiveCentsSchema } from './money';
import { PercentSchema, ShareSchema } from './percent';

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

/** Where the transaction came from: Open Finance (Malvo) or typed in by the user. */
export const TransactionSourceSchema = z.enum(['open_finance', 'manual']);
export type TransactionSource = z.infer<typeof TransactionSourceSchema>;

export const InstallmentSchema = z
  .object({ current: z.int().positive(), total: z.int().min(2) })
  .refine(({ current, total }) => current <= total, { message: 'current must be ≤ total' });
export type Installment = z.infer<typeof InstallmentSchema>;

/** Credit card bill a purchase was charged to ("Outubro · vence em 10/10"). */
export const TransactionInvoiceSchema = z.object({
  month: YearMonthSchema,
  dueOn: IsoDateSchema,
});
export type TransactionInvoice = z.infer<typeof TransactionInvoiceSchema>;

export const TransactionSchema = z
  .object({
    id: TransactionIdSchema,
    accountId: AccountIdSchema,
    /** Always positive; the sign comes from `direction`. */
    amount: PositiveCentsSchema,
    currency: CurrencySchema,
    direction: TransactionDirectionSchema,
    type: TransactionTypeSchema,
    source: TransactionSourceSchema,
    /** Booking date (São Paulo calendar day). */
    date: IsoDateSchema,
    /** Exact instant, when the institution reports it. */
    occurredAt: IsoDateTimeSchema.nullable(),
    /** Raw description from the bank statement ("LOJAELETRON*ONLINE SP"). */
    description: z.string().min(1),
    /** Cleaned-up merchant name, when recognised. */
    merchantName: z.string().min(1).nullable(),
    /** Category assigned by the API's classifier. */
    autoCategoryId: CategoryIdSchema.nullable(),
    /** Category chosen by the user; wins over the automatic one. */
    userCategoryId: CategoryIdSchema.nullable(),
    /** Effective category: `userCategoryId ?? autoCategoryId`. */
    categoryId: CategoryIdSchema.nullable(),
    /** Finer split of the effective category, when known (always inside `categoryId`). */
    subcategoryId: SubcategoryIdSchema.nullable(),
    /** "3/10" for credit card installments; `null` = paid at once. */
    installment: InstallmentSchema.nullable(),
    /** Credit card purchases only. */
    invoice: TransactionInvoiceSchema.nullable(),
    /** Flagged as out of the user's usual pattern (see `UnusualTransaction`). */
    isUnusual: z.boolean(),
    /** Marked by the user as a repeated entry: left out of totals and caps. */
    markedDuplicate: z.boolean(),
    /** Left out of reports (still counts in caps and balances). */
    hiddenFromReports: z.boolean(),
    /** Free note written by the user. */
    note: z.string().min(1).max(280).nullable(),
    ...timestamps,
  })
  .refine((tx) => tx.categoryId === (tx.userCategoryId ?? tx.autoCategoryId), {
    message: 'categoryId must equal userCategoryId ?? autoCategoryId',
    path: ['categoryId'],
  })
  .refine(
    (tx) => tx.subcategoryId === null || SUBCATEGORY_PARENT[tx.subcategoryId] === tx.categoryId,
    {
      message: 'subcategoryId must belong to categoryId',
      path: ['subcategoryId'],
    },
  );
export type Transaction = z.infer<typeof TransactionSchema>;

export const TransactionListQuerySchema = z.object({
  ...CursorQuerySchema.shape,
  ...PeriodQuerySchema.shape,
  accountId: AccountIdSchema.optional(),
  categoryId: CategoryIdSchema.optional(),
  subcategoryId: SubcategoryIdSchema.optional(),
  direction: TransactionDirectionSchema.optional(),
  /** Free text over description and merchant. */
  search: z.string().min(1).max(100).optional(),
  unusualOnly: z.boolean().optional(),
});
export type TransactionListQuery = z.infer<typeof TransactionListQuerySchema>;

/** Same filters as the list, without pagination. */
export const TransactionSummaryQuerySchema = TransactionListQuerySchema.omit({
  cursor: true,
  limit: true,
});
export type TransactionSummaryQuery = z.infer<typeof TransactionSummaryQuerySchema>;

/** Header of "Todos os lançamentos": how many and how much came in and went out. */
export const TransactionSummarySchema = z.object({
  count: z.int().nonnegative(),
  totalIn: NonNegativeCentsSchema,
  totalOut: NonNegativeCentsSchema,
});
export type TransactionSummary = z.infer<typeof TransactionSummarySchema>;

export const CorrectCategoryBodySchema = z.object({
  categoryId: CategoryIdSchema,
  /** Also recategorise past and future transactions of the same merchant. */
  applyToSimilar: z.boolean().optional(),
});
export type CorrectCategoryBody = z.infer<typeof CorrectCategoryBodySchema>;

/** User-editable flags of a transaction ("Mais ações"). `note: null` removes the note. */
export const UpdateTransactionBodySchema = z.object({
  note: z.string().trim().min(1).max(280).nullable().optional(),
  markedDuplicate: z.boolean().optional(),
  hiddenFromReports: z.boolean().optional(),
});
export type UpdateTransactionBody = z.infer<typeof UpdateTransactionBodySchema>;

/** Spending of a subcategory inside the category summary ("Onde foi"). */
export const SubcategorySpendingSchema = z.object({
  subcategoryId: SubcategoryIdSchema,
  spent: NonNegativeCentsSchema,
  count: z.int().nonnegative(),
  /** Share of the category's spending (2 decimals, the list sums 100). */
  share: ShareSchema,
});
export type SubcategorySpending = z.infer<typeof SubcategorySpendingSchema>;

/** Header of "Lançamentos de uma categoria". Missing history is `null` ("—"). */
export const CategoryMonthSummarySchema = z.object({
  categoryId: CategoryIdSchema,
  month: YearMonthSchema,
  spent: NonNegativeCentsSchema,
  count: z.int().nonnegative(),
  /** Share of all the month's outflows. */
  shareOfOutflows: ShareSchema,
  previousMonthSpent: NonNegativeCentsSchema.nullable(),
  /** `spent` against the previous month; `null` without history or when it was zero. */
  changePercent: PercentSchema.nullable(),
  /** Cap of the category, when there is one. */
  budget: z
    .object({
      limit: PositiveCentsSchema,
      usedPercent: PercentSchema,
      status: BudgetStatusSchema,
      /** Warning amounts, ascending (from the cap's percent thresholds). */
      warnings: z.array(PositiveCentsSchema),
      /** Warnings already sent this month. */
      warningsSent: z.array(PositiveCentsSchema),
      /** Estimated month total at the current pace; `null` early in the month. */
      projectedSpent: NonNegativeCentsSchema.nullable(),
    })
    .nullable(),
  subcategories: z.array(SubcategorySpendingSchema),
});
export type CategoryMonthSummary = z.infer<typeof CategoryMonthSummarySchema>;

export const CategorySummaryQuerySchema = z.object({
  /** Omit for the current month (São Paulo). */
  month: YearMonthSchema.optional(),
  accountId: AccountIdSchema.optional(),
});
export type CategorySummaryQuery = z.infer<typeof CategorySummaryQuerySchema>;
