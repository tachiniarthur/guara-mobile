import type { AssistantId } from '@guara/types';
import { create } from 'zustand';

import { useSubscriptionStore } from '@/stores';

import {
  CONVERSATION,
  CONVERSATION_GROUPS,
  type ChatFile,
  type ChatMessage,
  type ConversationGroup,
  type RichText,
} from './data';

export type ChatPanelView = 'history' | 'conversation';

/** A page that opens the chat about itself ("Tamanduá · Lendo este relatório com você"). */
export interface ChatContext {
  assistant: AssistantId;
  subtitle: string;
  intro: RichText;
  question: string;
  suggestions: readonly string[];
  placeholder: string;
}

interface ChatState {
  /** The current conversation, shared by the side panel and the full-screen page. */
  messages: ChatMessage[];
  /** Id and title of the open conversation (`null` id: a new one, not saved yet). */
  currentId: string | null;
  title: string;
  /** History, by period. */
  groups: ConversationGroup[];
  send: (text: string, attachment?: ChatFile) => void;
  startNew: () => void;
  rename: (title: string) => void;
  togglePin: (id: string) => void;
  /** Deletes a conversation from the history (the spending data stays). */
  remove: (id: string) => void;
  /** Assistant the composer is talking to ("@Pacu"); `null` = the whole team. */
  addressee: AssistantId | null;
  setAddressee: (assistant: AssistantId | null) => void;
  /** Side panel of wide tablets: visible by default, like the design. */
  panelOpen: boolean;
  panelView: ChatPanelView;
  context: ChatContext | null;
  openPanel: (view?: ChatPanelView) => void;
  closePanel: () => void;
  showHistory: () => void;
  showConversation: () => void;
  setContext: (context: ChatContext | null) => void;
  /**
   * Page under the chat when it was opened ("/spending"): "Sair da tela cheia" goes back to it
   * with the chat open again.
   */
  origin: string | null;
  setOrigin: (origin: string) => void;
}

const NEW_TITLE = 'Nova conversa';

const updateItem = (
  groups: ConversationGroup[],
  id: string,
  patch: (item: ConversationGroup['items'][number]) => Partial<ConversationGroup['items'][number]>,
) =>
  groups.map((group) => ({
    ...group,
    items: group.items.map((item) => (item.id === id ? { ...item, ...patch(item) } : item)),
  }));

export const useChatStore = create<ChatState>()((set) => ({
  messages: CONVERSATION.messages,
  currentId: CONVERSATION.id,
  title: CONVERSATION.title,
  groups: CONVERSATION_GROUPS,
  send: (text, attachment) => {
    // Each question counts toward the plan's monthly limit.
    useSubscriptionStore.getState().countQuestion();
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `u-${state.messages.length}`,
          role: 'user',
          text,
          ...(attachment ? { attachment } : null),
        },
      ],
      // Once the user writes, the page context gives way to the conversation.
      context: null,
      panelView: 'conversation',
    }));
  },
  startNew: () =>
    set({
      messages: [],
      currentId: null,
      title: NEW_TITLE,
      context: null,
      panelView: 'conversation',
    }),
  rename: (title) =>
    set((state) => ({
      title,
      groups: state.currentId
        ? updateItem(state.groups, state.currentId, () => ({ title }))
        : state.groups,
    })),
  togglePin: (id) =>
    set((state) => ({
      groups: updateItem(state.groups, id, (item) => ({ pinned: !item.pinned })),
    })),
  remove: (id) =>
    set((state) => ({
      groups: state.groups.map((group) => ({
        ...group,
        items: group.items.filter((item) => item.id !== id),
      })),
      ...(state.currentId === id
        ? { messages: [], currentId: null, title: NEW_TITLE, context: null }
        : null),
    })),
  addressee: null,
  setAddressee: (addressee) => set({ addressee }),
  panelOpen: true,
  panelView: 'history',
  context: null,
  openPanel: (view) => set((state) => ({ panelOpen: true, panelView: view ?? state.panelView })),
  closePanel: () => set({ panelOpen: false }),
  showHistory: () => set({ panelView: 'history' }),
  showConversation: () => set({ panelView: 'conversation' }),
  setContext: (context) =>
    set(context ? { context, panelOpen: true, panelView: 'conversation' } : { context: null }),
  origin: null,
  setOrigin: (origin) => set({ origin }),
}));
