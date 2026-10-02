/**
 * Shape of the in-memory "database". Records are stored in wire format (`z.input` of the
 * contract schemas: plain strings/numbers); fields the API derives (spent, percentages,
 * totals…) are computed by `logic/` when a handler answers.
 */
import type {
  AccountPlanSchema,
  AppNotificationSchema,
  AssetSchema,
  BankAccountSchema,
  BankConnectionSchema,
  CategorySchema,
  ChatMessageSchema,
  ConversationSchema,
  CorporateEventSchema,
  DividendSchema,
  DuplicateResolution,
  EarningsReportSchema,
  GoalSchema,
  InvestorProfileSchema,
  NotificationPreferencesSchema,
  PositionSchema,
  PriceAlertSchema,
  PropertySchema,
  ReportExportSchema,
  SimulationSchema,
  SubscriptionSchema,
  TransactionSchema,
  UnusualReason,
  UnusualStatus,
  UserSchema,
} from '@guara/types';
import type { z } from 'zod';

type Wire<S extends z.ZodType> = z.input<S>;

export type TransactionRecord = Wire<typeof TransactionSchema>;
export type AccountRecord = Wire<typeof BankAccountSchema>;
export type ConnectionRecord = Omit<Wire<typeof BankConnectionSchema>, 'accounts'>;
export type SubscriptionRecord = Wire<typeof SubscriptionSchema>;
export type NotificationRecord = Wire<typeof AppNotificationSchema>;
export type PositionRecord = Omit<Wire<typeof PositionSchema>, 'portfolioPercent'>;
export type PropertyRecord = Wire<typeof PropertySchema>;
export type PriceAlertRecord = Omit<Wire<typeof PriceAlertSchema>, 'currentPrice' | 'assetName'>;
export type SimulationRecord = Wire<typeof SimulationSchema>;
export type GoalRecord = Wire<typeof GoalSchema>;
export type ConversationRecord = Wire<typeof ConversationSchema>;
export type MessageRecord = Wire<typeof ChatMessageSchema>;
export type ReportExportRecord = Wire<typeof ReportExportSchema>;

export interface BudgetRecord {
  id: string;
  categoryId: Wire<typeof CategorySchema>['id'];
  limit: number;
  warningThresholds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface UnusualRecord {
  transactionId: string;
  reasons: UnusualReason[];
  status: UnusualStatus;
  detectedAt: string;
}

export interface DuplicateRecord {
  id: string;
  positionIds: [string, string];
  status: 'pending' | 'resolved';
  resolution: DuplicateResolution | null;
  detectedAt: string;
  resolvedAt: string | null;
  /** Positions as they were when resolved (one of them may no longer exist). */
  snapshot: (PositionRecord & { portfolioPercent: number | null })[] | null;
}

/** Market data of one ticker (quote + detail). History is generated on demand. */
export interface AssetRecord {
  quote: Wire<typeof AssetSchema>;
  /** Annualised volatility used to draw the price history (percentage points). */
  volatility: number;
  lastEarnings: Wire<typeof EarningsReportSchema> | null;
  dividends: Wire<typeof DividendSchema>[];
  events: Wire<typeof CorporateEventSchema>[];
}

/** Monthly history behind the wealth evolution chart (values are derived backwards). */
export interface WealthHistory {
  /** Month of each entry, oldest first; the last one is the current month. */
  months: string[];
  /** Portfolio return of each month (percentage points). */
  returns: number[];
  /** CDI of each month (percentage points). */
  cdi: number[];
  /** Money put in during each month (cents). */
  contributions: number[];
}

export interface MockDb {
  /** Clock of the fake world (ms). Mutations advance it by one second. */
  clock: number;
  /** Counter for ids created at runtime. */
  sequence: number;
  user: Wire<typeof UserSchema>;
  plan: Wire<typeof AccountPlanSchema>['plan'];
  aiMessagesThisMonth: number;
  notificationPreferences: Wire<typeof NotificationPreferencesSchema>;
  investorProfile: Wire<typeof InvestorProfileSchema> | null;
  categories: Wire<typeof CategorySchema>[];
  connections: ConnectionRecord[];
  accounts: AccountRecord[];
  transactions: TransactionRecord[];
  unusual: UnusualRecord[];
  subscriptions: SubscriptionRecord[];
  budgets: BudgetRecord[];
  exports: ReportExportRecord[];
  assets: AssetRecord[];
  positions: PositionRecord[];
  duplicates: DuplicateRecord[];
  wealthHistory: WealthHistory | null;
  properties: PropertyRecord[];
  priceAlerts: PriceAlertRecord[];
  simulations: SimulationRecord[];
  goals: GoalRecord[];
  conversations: ConversationRecord[];
  messages: MessageRecord[];
  notifications: NotificationRecord[];
}
