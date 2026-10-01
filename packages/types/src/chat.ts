import type { Entity, ISODateTime } from './common';

/** The six AI assistants. Animal names appear only in chat/assistant UI. */
export type AssistantId =
  | 'capivara' // coordinator / router
  | 'tamandua' // spending
  | 'pacu' // investments & simulations
  | 'caramelo' // price alerts
  | 'quero-quero' // unusual purchases
  | 'onca'; // goals

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: ChatRole;
  /** Which assistant answered (only for `role: "assistant"`). */
  assistantId: AssistantId | null;
  /** Markdown content. */
  content: string;
  createdAt: ISODateTime;
}

export interface Conversation extends Entity {
  title: string | null;
  lastMessageAt: ISODateTime | null;
  lastMessagePreview: string | null;
}

/** Server-sent events emitted by the chat streaming endpoint. */
export type ChatStreamEvent =
  | { type: 'start'; messageId: string; assistantId: AssistantId }
  | { type: 'delta'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string };
