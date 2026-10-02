/** AI chat. The app receives replies by SSE from our API (never from Claude directly). */
import { z } from 'zod';

import { CategoryIdSchema } from './category';
import { ApiErrorCodeSchema, IsoDateSchema, IsoDateTimeSchema, timestamps } from './common';
import {
  BudgetIdSchema,
  ConversationIdSchema,
  MessageIdSchema,
  PositionIdSchema,
  TickerSchema,
} from './ids';
import { NonNegativeCentsSchema, PositiveCentsSchema } from './money';
import { PercentSchema, ShareSchema } from './percent';
import { PriceAlertSideSchema } from './price-alert';

/** The six assistants. Animal names appear only in the chat/assistant UI. */
export const AssistantIdSchema = z.enum([
  'capivara', // coordinator / router
  'tamandua', // spending
  'pacu', // investments and simulations
  'caramelo', // price alerts
  'quero_quero', // unusual purchases
  'onca', // goals
]);
export type AssistantId = z.infer<typeof AssistantIdSchema>;

export const ChatRoleSchema = z.enum(['user', 'assistant']);
export type ChatRole = z.infer<typeof ChatRoleSchema>;

// --- Content blocks --------------------------------------------------------------------------

export const TextBlockSchema = z.object({
  type: z.literal('text'),
  /** Markdown. */
  text: z.string(),
});

/** Spending cap progress card. */
export const BudgetBarBlockSchema = z.object({
  type: z.literal('budget_bar'),
  budgetId: BudgetIdSchema.nullable(),
  categoryId: CategoryIdSchema,
  limit: PositiveCentsSchema,
  spent: NonNegativeCentsSchema,
});

/** Small line chart of an amount over time. */
export const MiniChartBlockSchema = z.object({
  type: z.literal('mini_chart'),
  title: z.string().min(1),
  points: z.array(z.object({ date: IsoDateSchema, value: NonNegativeCentsSchema })).min(2),
});

/** Summary of one investment position. */
export const PositionSummaryBlockSchema = z.object({
  type: z.literal('position_summary'),
  positionId: PositionIdSchema.nullable(),
  ticker: TickerSchema.nullable(),
  name: z.string().min(1),
  currentValue: NonNegativeCentsSchema.nullable(),
  returnPercent: PercentSchema.nullable(),
  portfolioPercent: ShareSchema.nullable(),
});

export const CardBlockSchema = z.discriminatedUnion('type', [
  BudgetBarBlockSchema,
  MiniChartBlockSchema,
  PositionSummaryBlockSchema,
]);
export type CardBlock = z.infer<typeof CardBlockSchema>;

export const ContentBlockSchema = z.discriminatedUnion('type', [
  TextBlockSchema,
  BudgetBarBlockSchema,
  MiniChartBlockSchema,
  PositionSummaryBlockSchema,
]);
export type ContentBlock = z.infer<typeof ContentBlockSchema>;

// --- Suggested actions -----------------------------------------------------------------------

const actionLabel = z.string().min(1).max(40);

export const SuggestedActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('create_alert'),
    /** Button text in pt-BR, written by the assistant. */
    label: actionLabel,
    ticker: TickerSchema,
    side: PriceAlertSideSchema,
    targetPrice: PositiveCentsSchema,
  }),
  z.object({
    type: z.literal('create_budget'),
    label: actionLabel,
    categoryId: CategoryIdSchema,
    limit: PositiveCentsSchema,
  }),
  z.object({ type: z.literal('open_asset'), label: actionLabel, ticker: TickerSchema }),
]);
export type SuggestedAction = z.infer<typeof SuggestedActionSchema>;

// --- Conversations and messages --------------------------------------------------------------

export const ConversationSchema = z.object({
  id: ConversationIdSchema,
  title: z.string().min(1).nullable(),
  /** Assistant that answered last. */
  assistantId: AssistantIdSchema.nullable(),
  lastMessageAt: IsoDateTimeSchema.nullable(),
  lastMessagePreview: z.string().nullable(),
  ...timestamps,
});
export type Conversation = z.infer<typeof ConversationSchema>;

export const ChatMessageSchema = z.object({
  id: MessageIdSchema,
  conversationId: ConversationIdSchema,
  role: ChatRoleSchema,
  /** Who answered (`role: 'assistant'` only). */
  assistantId: AssistantIdSchema.nullable(),
  blocks: z.array(ContentBlockSchema).min(1),
  actions: z.array(SuggestedActionSchema),
  createdAt: IsoDateTimeSchema,
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const CreateConversationBodySchema = z.object({
  /** Start talking to a specific assistant; the Capivara routes when omitted. */
  assistantId: AssistantIdSchema.optional(),
});
export type CreateConversationBody = z.infer<typeof CreateConversationBodySchema>;

export const SendMessageBodySchema = z.object({ content: z.string().min(1).max(4000) });
export type SendMessageBody = z.infer<typeof SendMessageBodySchema>;

// --- Streaming (SSE) -------------------------------------------------------------------------

/**
 * Events of the chat stream, in order: `start` → (`delta` | `card` | `action`)* → `done`,
 * or `error` at any point. Each SSE message carries one event as JSON in `data`
 * (the SSE `event:` field repeats `type`).
 */
export const ChatStreamEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('start'),
    conversationId: ConversationIdSchema,
    /** Id of the user message that was stored. */
    userMessageId: MessageIdSchema,
    /** Id the assistant reply will have once `done`. */
    messageId: MessageIdSchema,
    assistantId: AssistantIdSchema,
  }),
  /** Text appended to the current text block (markdown). */
  z.object({ type: z.literal('delta'), text: z.string() }),
  z.object({ type: z.literal('card'), block: CardBlockSchema }),
  z.object({ type: z.literal('action'), action: SuggestedActionSchema }),
  z.object({ type: z.literal('done'), message: ChatMessageSchema }),
  z.object({ type: z.literal('error'), code: ApiErrorCodeSchema, message: z.string().min(1) }),
]);
export type ChatStreamEvent = z.infer<typeof ChatStreamEventSchema>;
