/**
 * Branded identifiers, one per entity, so an id of one entity cannot be passed where
 * another is expected. Ids are opaque strings issued by the API.
 *
 * Branding only affects the parsed (output) type: requests accept plain strings, and parsed
 * responses carry the branded type.
 */
import { z } from 'zod';

function id<Brand extends string>() {
  return z.string().min(1).brand<Brand>();
}

export const UserIdSchema = id<'UserId'>();
export type UserId = z.infer<typeof UserIdSchema>;

export const PlanIdSchema = id<'PlanId'>();
export type PlanId = z.infer<typeof PlanIdSchema>;

export const InstitutionIdSchema = id<'InstitutionId'>();
export type InstitutionId = z.infer<typeof InstitutionIdSchema>;

export const BankConnectionIdSchema = id<'BankConnectionId'>();
export type BankConnectionId = z.infer<typeof BankConnectionIdSchema>;

export const AccountIdSchema = id<'AccountId'>();
export type AccountId = z.infer<typeof AccountIdSchema>;

export const TransactionIdSchema = id<'TransactionId'>();
export type TransactionId = z.infer<typeof TransactionIdSchema>;

export const SubscriptionIdSchema = id<'SubscriptionId'>();
export type SubscriptionId = z.infer<typeof SubscriptionIdSchema>;

export const BudgetIdSchema = id<'BudgetId'>();
export type BudgetId = z.infer<typeof BudgetIdSchema>;

export const ReportExportIdSchema = id<'ReportExportId'>();
export type ReportExportId = z.infer<typeof ReportExportIdSchema>;

export const PositionIdSchema = id<'PositionId'>();
export type PositionId = z.infer<typeof PositionIdSchema>;

export const DuplicateIdSchema = id<'DuplicateId'>();
export type DuplicateId = z.infer<typeof DuplicateIdSchema>;

export const PropertyIdSchema = id<'PropertyId'>();
export type PropertyId = z.infer<typeof PropertyIdSchema>;

export const PriceAlertIdSchema = id<'PriceAlertId'>();
export type PriceAlertId = z.infer<typeof PriceAlertIdSchema>;

export const SimulationIdSchema = id<'SimulationId'>();
export type SimulationId = z.infer<typeof SimulationIdSchema>;

export const GoalIdSchema = id<'GoalId'>();
export type GoalId = z.infer<typeof GoalIdSchema>;

export const ConversationIdSchema = id<'ConversationId'>();
export type ConversationId = z.infer<typeof ConversationIdSchema>;

export const MessageIdSchema = id<'MessageId'>();
export type MessageId = z.infer<typeof MessageIdSchema>;

export const NotificationIdSchema = id<'NotificationId'>();
export type NotificationId = z.infer<typeof NotificationIdSchema>;

/** Market ticker in upper case: "PETR4", "HGLG11", "BTC", "IBOV". */
export const TickerSchema = z.string().regex(/^[A-Z0-9]{2,12}$/, 'Expected an upper-case ticker');
export type Ticker = z.infer<typeof TickerSchema>;
