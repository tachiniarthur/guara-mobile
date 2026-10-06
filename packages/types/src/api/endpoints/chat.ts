import { z } from 'zod';

import {
  ChatMessageSchema,
  ConversationIdSchema,
  ConversationSchema,
  CreateConversationBodySchema,
  CursorQuerySchema,
  UpdateConversationBodySchema,
  paginated,
} from '../../domain';
import { NoContentSchema, defineEndpoints } from '../define';

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
  'chat.updateConversation': {
    method: 'PATCH',
    path: '/v1/chat/conversations/:conversationId',
    summary: 'Rename or pin a conversation',
    params: conversationParams,
    body: UpdateConversationBodySchema,
    response: ConversationSchema,
  },
  'chat.deleteConversation': {
    method: 'DELETE',
    path: '/v1/chat/conversations/:conversationId',
    summary: 'Delete a conversation (spending data stays)',
    params: conversationParams,
    response: NoContentSchema,
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
