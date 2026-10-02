/**
 * Streaming endpoints (Server-Sent Events). They do not fit the JSON request/response shape:
 * the response is `text/event-stream`, and every SSE message carries one `event` as JSON in
 * its `data` field (the SSE `event:` name repeats `type`).
 *
 * Chat flow: `POST /v1/chat/conversations/:conversationId/messages` with `{ content }`
 * → `start` → (`delta` | `card` | `action`)* → `done` (with the final message) or `error`.
 * HTTP errors before the stream starts use the regular `ApiError` JSON body.
 */
import { z } from 'zod';

import { ChatStreamEventSchema, ConversationIdSchema, SendMessageBodySchema } from '../domain';
import type { HttpMethod } from './define';

export interface StreamEndpointDef {
  method: HttpMethod;
  path: `/v1/${string}`;
  summary: string;
  params?: z.ZodObject;
  body?: z.ZodType;
  /** Schema of each event in the stream. */
  event: z.ZodType;
}

function defineStreamEndpoints<const T extends Record<string, StreamEndpointDef>>(defs: T): T {
  return defs;
}

export const streamEndpoints = defineStreamEndpoints({
  'chat.sendMessage': {
    method: 'POST',
    path: '/v1/chat/conversations/:conversationId/messages',
    summary: 'Send a user message and stream the assistant reply',
    params: z.object({ conversationId: ConversationIdSchema }),
    body: SendMessageBodySchema,
    event: ChatStreamEventSchema,
  },
});

export type StreamEndpoints = typeof streamEndpoints;
export type StreamEndpointName = keyof StreamEndpoints;

type InputOf<E, Key extends 'params' | 'body'> = E extends {
  [P in Key]: infer Schema extends z.ZodType;
}
  ? { [P in Key]: z.input<Schema> }
  : { [P in Key]?: undefined };

/** What a client sends to a stream endpoint. */
export type StreamRequest<N extends StreamEndpointName> = InputOf<StreamEndpoints[N], 'params'> &
  InputOf<StreamEndpoints[N], 'body'>;

/** Parsed event of a stream endpoint. */
export type StreamEvent<N extends StreamEndpointName> = z.output<StreamEndpoints[N]['event']>;
