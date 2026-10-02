import { z } from 'zod';

import {
  ChatMessageSchema,
  ConversationIdSchema,
  ConversationSchema,
  CreateConversationBodySchema,
  CursorQuerySchema,
  paginated,
} from '../../domain';
import { defineEndpoints } from '../define';

const conversationParams = z.object({ conversationId: ConversationIdSchema });

/** Chat history (JSON). Sending a message streams by SSE — see `streamEndpoints`. */
export const chatEndpoints = defineEndpoints({
  'chat.listConversations': {
    method: 'GET',
    path: '/v1/chat/conversations',
    summary: 'Conversations, most recent first',
    query: CursorQuerySchema,
    response: paginated(ConversationSchema),
  },
  'chat.createConversation': {
    method: 'POST',
    path: '/v1/chat/conversations',
    summary: 'Start a conversation',
    body: CreateConversationBodySchema,
    response: ConversationSchema,
  },
  'chat.getConversation': {
    method: 'GET',
    path: '/v1/chat/conversations/:conversationId',
    summary: 'One conversation',
    params: conversationParams,
    response: ConversationSchema,
  },
  'chat.listMessages': {
    method: 'GET',
    path: '/v1/chat/conversations/:conversationId/messages',
    summary: 'Messages, newest first (cursor goes back in time)',
    params: conversationParams,
    query: CursorQuerySchema,
    response: paginated(ChatMessageSchema),
  },
});
