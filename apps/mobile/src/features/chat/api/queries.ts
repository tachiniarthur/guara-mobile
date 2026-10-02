import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';

import { chatKeys } from './keys';

export function useConversations() {
  return useInfiniteQuery({
    queryKey: chatKeys.conversations(),
    queryFn: ({ pageParam, signal }) =>
      apiRequest('chat.listConversations', { query: { cursor: pageParam }, signal }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: chatKeys.conversation(conversationId),
    queryFn: ({ signal }) =>
      apiRequest('chat.getConversation', { params: { conversationId }, signal }),
  });
}

/** Messages, newest first; `fetchNextPage` goes back in time. */
export function useMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: ({ pageParam, signal }) =>
      apiRequest('chat.listMessages', {
        params: { conversationId },
        query: { cursor: pageParam },
        signal,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
