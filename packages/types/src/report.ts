import { z } from 'zod';

import { CategoryIdSchema } from './category';
import {
  DateRangeSchema,
  IsoDateSchema,
  IsoDateTimeSchema,
  PeriodQuerySchema,
  PeriodSchema,
} from './common';
import { ReportExportIdSchema } from './ids';
import { CentsSchema, NonNegativeCentsSchema } from './money';
import { PercentSchema, ShareSchema } from './percent';
import { TransactionSchema } from './transaction';

export const ReportGranularitySchema = z.enum(['day', 'week', 'month']);
export type ReportGranularity = z.infer<typeof ReportGranularitySchema>;

export const CashFlowTotalsSchema = z.object({
  income: NonNegativeCentsSchema,
  expenses: NonNegativeCentsSchema,
  /** income − expenses */
  net: CentsSchema,
});
export type CashFlowTotals = z.infer<typeof CashFlowTotalsSchema>;

export const CashFlowBucketSchema = CashFlowTotalsSchema.extend({
  /** First day of the bucket. */
  start: IsoDateSchema,
});
export type CashFlowBucket = z.infer<typeof CashFlowBucketSchema>;

export const ReportQuerySchema = PeriodQuerySchema.extend({
  granularity: ReportGranularitySchema.optional(),
});
export type ReportQuery = z.infer<typeof ReportQuerySchema>;

export const CategoryShareSchema = z.object({
  categoryId: CategoryIdSchema,
  amount: NonNegativeCentsSchema,
  percent: ShareSchema,
});
export type CategoryShare = z.infer<typeof CategoryShareSchema>;

/** Income × expenses for a period, compared with the previous period of the same length. */
export const ReportSummarySchema = z.object({
  range: DateRangeSchema,
  granularity: ReportGranularitySchema,
  cashFlow: z.array(CashFlowBucketSchema),
  totals: CashFlowTotalsSchema,
  previous: z.object({ range: DateRangeSchema, totals: CashFlowTotalsSchema }),
  /** Variation against the previous period; `null` when the previous value is zero. */
  change: z.object({ income: PercentSchema.nullable(), expenses: PercentSchema.nullable() }),
  /** Consolidated balance at the end of each bucket. */
  balanceOverTime: z.array(z.object({ date: IsoDateSchema, balance: CentsSchema })),
  expensesByCategory: z.array(CategoryShareSchema),
  /** Transactions that moved the balance the most (largest amounts, both directions). */
  topMovements: z.array(TransactionSchema),
});
export type ReportSummary = z.infer<typeof ReportSummarySchema>;

// --- Export ----------------------------------------------------------------------------------

export const ExportFormatSchema = z.enum(['pdf', 'xlsx', 'csv']);
export type ExportFormat = z.infer<typeof ExportFormatSchema>;

export const ExportStatusSchema = z.enum(['queued', 'processing', 'ready', 'sent', 'failed']);
export type ExportStatus = z.infer<typeof ExportStatusSchema>;

/** The file is always offered for download; `emailCopy` also sends it to the user's address. */
export const CreateReportExportBodySchema = z.object({
  format: ExportFormatSchema,
  period: PeriodSchema,
  emailCopy: z.boolean(),
});
export type CreateReportExportBody = z.infer<typeof CreateReportExportBodySchema>;

export const ReportExportSchema = z.object({
  id: ReportExportIdSchema,
  format: ExportFormatSchema,
  range: DateRangeSchema,
  status: ExportStatusSchema,
  requestedAt: IsoDateTimeSchema,
  completedAt: IsoDateTimeSchema.nullable(),
  /** "guara-relatorio-setembro-2026.pdf". */
  fileName: z.string().min(1),
  /** Temporary link (once `ready`). */
  downloadUrl: z.url().nullable(),
  expiresAt: IsoDateTimeSchema.nullable(),
  /** Where the copy was sent (`null` without `emailCopy`). */
  email: z.email().nullable(),
});
export type ReportExport = z.infer<typeof ReportExportSchema>;
