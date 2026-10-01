/**
 * Server-Sent Events over `expo/fetch` (supports streaming response bodies on
 * iOS/Android, including Expo Go). Used by the AI chat; the endpoint contract is a stub.
 */
import type { ChatStreamEvent } from '@guara/types';
import { fetch } from 'expo/fetch';

import { ApiError, buildUrl, getAuthHeaders } from './api-client';

export interface SSEMessage {
  event: string;
  data: string;
  id?: string;
}

/**
 * Incremental SSE parser (https://html.spec.whatwg.org/multipage/server-sent-events.html).
 * Feed it decoded text chunks of any size; it emits complete messages.
 */
export function createSSEParser(onMessage: (message: SSEMessage) => void) {
  let buffer = '';
  let event = '';
  let data: string[] = [];
  let id: string | undefined;

  const dispatch = () => {
    if (data.length > 0) onMessage({ event: event || 'message', data: data.join('\n'), id });
    event = '';
    data = [];
  };

  const processLine = (line: string) => {
    if (line === '') return dispatch();
    if (line.startsWith(':')) return; // comment / keep-alive
    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? '' : line.slice(colon + 1);
    if (value.startsWith(' ')) value = value.slice(1);
    if (field === 'event') event = value;
    else if (field === 'data') data.push(value);
    else if (field === 'id') id = value;
  };

  return {
    feed(chunk: string) {
      buffer += chunk;
      const lines = buffer.split(/\r\n|\r|\n/);
      // The last element may be an incomplete line; keep it for the next chunk.
      buffer = lines.pop() ?? '';
      lines.forEach(processLine);
    },
    end() {
      if (buffer) processLine(buffer);
      buffer = '';
      dispatch();
    },
  };
}

export interface StreamOptions {
  body?: unknown;
  signal?: AbortSignal;
  onMessage: (message: SSEMessage) => void;
}

/** POSTs to an API endpoint and streams its SSE response. Resolves when the stream ends. */
export async function streamSSE(path: string, { body, signal, onMessage }: StreamOptions) {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new ApiError(response.status, 'Streaming request failed');
  }

  const parser = createSSEParser(onMessage);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parser.feed(decoder.decode(value, { stream: true }));
  }
  parser.end();
}

/**
 * Sends a chat message and streams the assistant reply.
 * TODO: confirm the endpoint path and payload with the NestJS API.
 */
export function streamChatReply(
  conversationId: string,
  content: string,
  onEvent: (event: ChatStreamEvent) => void,
  signal?: AbortSignal,
) {
  return streamSSE(`/chat/conversations/${encodeURIComponent(conversationId)}/messages`, {
    body: { content },
    signal,
    onMessage: ({ data }) => onEvent(JSON.parse(data) as ChatStreamEvent),
  });
}
