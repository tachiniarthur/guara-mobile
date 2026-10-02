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

/** `download`: file link in the app; `email`: sent to the user's address. */
export const ExportDeliverySchema = z.enum(['download', 'email']);
export type ExportDelivery = z.infer<typeof ExportDeliverySchema>;

export const ExportStatusSchema = z.enum(['queued', 'processing', 'ready', 'sent', 'failed']);
export type ExportStatus = z.infer<typeof ExportStatusSchema>;

export const CreateReportExportBodySchema = z.object({
  format: ExportFormatSchema,
  period: PeriodSchema,
  delivery: ExportDeliverySchema,
});
export type CreateReportExportBody = z.infer<typeof CreateReportExportBodySchema>;

export const ReportExportSchema = z.object({
  id: ReportExportIdSchema,
  format: ExportFormatSchema,
  delivery: ExportDeliverySchema,
  range: DateRangeSchema,
  status: ExportStatusSchema,
  requestedAt: IsoDateTimeSchema,
  completedAt: IsoDateTimeSchema.nullable(),
  /** Temporary link (`download` + `ready`). */
  downloadUrl: z.url().nullable(),
  expiresAt: IsoDateTimeSchema.nullable(),
  /** Destination for `email` deliveries. */
  email: z.email().nullable(),
});
export type ReportExport = z.infer<typeof ReportExportSchema>;
