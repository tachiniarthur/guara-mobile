import type { AssistantId, CardBlock, ChatStreamEvent, SuggestedAction } from '@guara/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { ApiError, apiStream } from '@/lib/api';

import { chatKeys } from './keys';

/** Assistant reply while it streams in. */
export interface StreamingReply {
  messageId: string | null;
  assistantId: AssistantId | null;
  /** Markdown accumulated from `delta` events. */
  text: string;
  cards: CardBlock[];
  actions: SuggestedAction[];
  done: boolean;
}

export const EMPTY_REPLY: StreamingReply = {
  messageId: null,
  assistantId: null,
  text: '',
  cards: [],
  actions: [],
  done: false,
};

/** Folds one SSE event into the reply being displayed. */
export function reduceStreamEvent(reply: StreamingReply, event: ChatStreamEvent): StreamingReply {
  switch (event.type) {
    case 'start':
      return { ...EMPTY_REPLY, messageId: event.messageId, assistantId: event.assistantId };
    case 'delta':
      return { ...reply, text: reply.text + event.text };
    case 'card':
      return { ...reply, cards: [...reply.cards, event.block] };
    case 'action':
      return { ...reply, actions: [...reply.actions, event.action] };
    case 'done':
      return { ...reply, done: true };
    case 'error':
      return reply;
  }
}

/**
 * Sends a message and exposes the assistant reply as it streams (`reply`). When the stream
 * ends the conversation queries refetch and `reply` goes back to `null`. Leaving the screen
 * aborts the stream.
 */
export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const [reply, setReply] = useState<StreamingReply | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const mutation = useMutation({
    mutationFn: async (content: string) => {
      controller.current?.abort();
      controller.current = new AbortController();
      setReply(EMPTY_REPLY);
      let failure: ApiError | null = null;
      await apiStream(
        'chat.sendMessage',
        { params: { conversationId }, body: { content } },
        {
          signal: controller.current.signal,
          onEvent: (event) => {
            if (event.type === 'error') failure = new ApiError(event.code, event.message);
            setReply((current) => reduceStreamEvent(current ?? EMPTY_REPLY, event));
          },
        },
      );
      if (failure) throw failure;
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: chatKeys.all });
      setReply(null);
    },
  });

  return { ...mutation, reply };
}
