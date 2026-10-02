/**
 * Server-Sent Events over `expo/fetch` (supports streaming response bodies on
 * iOS/Android, including Expo Go). Low-level: the typed chat stream lives in the API
 * transport (`src/lib/api`).
 */
import { fetch } from 'expo/fetch';

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

export interface StreamSSEOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
  onMessage: (message: SSEMessage) => void;
  /** Builds the error thrown when the server answers with a non-2xx status. */
  onResponseError: (response: Response) => Promise<Error>;
}

/** Sends a request and streams its SSE response. Resolves when the stream ends. */
export async function streamSSE(
  url: string,
  { method = 'POST', headers, body, signal, onMessage, onResponseError }: StreamSSEOptions,
) {
  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'text/event-stream',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (!response.ok) throw await onResponseError(response as unknown as Response);
  if (!response.body) throw new Error('Streaming response without a body');

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
