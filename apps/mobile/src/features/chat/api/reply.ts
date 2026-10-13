import type { AssistantId } from '@guara/types';
import { normalizeForSearch } from '@guara/utils';

import { ASSISTANTS } from '../assistants';
import { SCRIPTED_REPLIES, type AssistantBlock, type RichText } from '../data';

/**
 * Steps of an answer, in the order of the `chat.sendMessage` stream of the contract
 * (`start` → `delta`/`card`* → `done` | `error`).
 */
export type ReplyEvent =
  | { type: 'start'; assistant: AssistantId; area: string }
  /** A new block (a text block starts empty and grows with `delta`). */
  | { type: 'block'; block: AssistantBlock }
  /** Text appended to the last text block. */
  | { type: 'delta'; part: RichText[number] }
  | { type: 'done' }
  | { type: 'error'; code: 'unavailable' | 'network'; assistant: AssistantId; area: string };

export interface ReplyRequest {
  content: string;
  /** Who was asked ("@Pacu"); `null` lets the Capivara route the question. */
  assistant: AssistantId | null;
}

/** Pauses of the stand-in (ms): before the first word and between words. */
export const REPLY_TIMING = { first: 600, word: 35 };

/** Area shown beside each assistant in the chat ("Capivara · Coordena a turma"). */
export const chatArea = (assistant: AssistantId) =>
  assistant === 'capivara' ? 'Coordena a turma' : ASSISTANTS[assistant].area;

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    if (signal.aborted) return resolve();
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      resolve();
    });
  });

/** Words of a text run, with the spaces kept so the parts join back as written. */
const words = (text: string) => text.match(/\S+\s*|\s+/g) ?? [];

/**
 * Stand-in for the chat stream while the API does not exist: it answers what the design shows
 * in full and reports every other question as unavailable, never inventing an answer. Swap it
 * for `apiStream('chat.sendMessage', …)` when the API arrives (same steps).
 */
export async function streamReply(
  request: ReplyRequest,
  { signal, onEvent }: { signal: AbortSignal; onEvent: (event: ReplyEvent) => void },
): Promise<void> {
  const key = normalizeForSearch(request.content);
  const script = SCRIPTED_REPLIES.find(
    (reply) =>
      reply.questions.some((question) => normalizeForSearch(question) === key) &&
      (request.assistant === null || request.assistant === reply.assistant),
  );
  await wait(REPLY_TIMING.first, signal);
  if (signal.aborted) return;
  if (!script) {
    const assistant = request.assistant ?? 'capivara';
    onEvent({ type: 'error', code: 'unavailable', assistant, area: chatArea(assistant) });
    return;
  }
  onEvent({ type: 'start', assistant: script.assistant, area: script.area });
  for (const block of script.blocks) {
    if (block.type !== 'text') {
      onEvent({ type: 'block', block });
      continue;
    }
    onEvent({ type: 'block', block: { type: 'text', content: [] } });
    for (const part of block.content) {
      for (const chunk of typeof part === 'string' ? words(part) : [part]) {
        await wait(REPLY_TIMING.word, signal);
        if (signal.aborted) return;
        onEvent({ type: 'delta', part: chunk });
      }
    }
  }
  onEvent({ type: 'done' });
}
