import type { AssistantId } from '@guara/types';

import { ASSISTANTS, assistantWith } from '../assistants';
import type { AssistantBlock, ChatMessage, RichText } from '../data';

/** Appends a streamed part to the last text block (consecutive plain text merges). */
export function appendPart(blocks: readonly AssistantBlock[], part: RichText[number]) {
  const last = blocks.at(-1);
  if (!last || last.type !== 'text') return [...blocks, { type: 'text' as const, content: [part] }];
  const content = [...last.content];
  const previous = content.at(-1);
  if (typeof part === 'string' && typeof previous === 'string') {
    content[content.length - 1] = previous + part;
  } else {
    content.push(part);
  }
  return [...blocks.slice(0, -1), { ...last, content }];
}

/** Title of a new conversation from its first question ("Quanto gastei com comida…"). */
export function titleFrom(question: string): string {
  const text = question.trim().replace(/\s+/g, ' ');
  const title = text.charAt(0).toUpperCase() + text.slice(1);
  if (title.length <= 40) return title;
  // Cut at the last whole word that fits.
  const cut = title.slice(0, 40);
  const space = cut.lastIndexOf(' ');
  return `${(space > 20 ? cut.slice(0, space) : cut.slice(0, 39)).trimEnd()}…`;
}

/**
 * "Hoje, 14:40 · com o Pacu", "Hoje, 14:45 · aguardando o Pacu" or "Ainda sem mensagens".
 */
export function conversationCaption(messages: readonly ChatMessage[], updated: string): string {
  if (messages.length === 0) return 'Ainda sem mensagens';
  const last = messages.findLast(
    (message) => message.role === 'assistant' || message.role === 'unavailable',
  );
  if (!last) return updated;
  const who: AssistantId = last.assistant;
  const { article, name } = ASSISTANTS[who];
  return last.role === 'unavailable'
    ? `${updated} · aguardando ${article} ${name}`
    : `${updated} · ${assistantWith('com', who)}`;
}
