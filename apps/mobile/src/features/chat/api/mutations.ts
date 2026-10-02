import type { AssistantId } from '@guara/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';

import { chatKeys } from './keys';

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assistantId?: AssistantId) =>
      apiRequest('chat.createConversation', { body: { assistantId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.conversations() }),
  });
}
