import { QUERY_ROOTS } from '@/constants/query-keys';

export const chatKeys = {
  all: [QUERY_ROOTS.chat] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  conversation: (conversationId: string) =>
    [...chatKeys.all, 'conversation', conversationId] as const,
  messages: (conversationId: string) => [...chatKeys.all, 'messages', conversationId] as const,
};
