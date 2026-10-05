import type { AssistantId } from '@guara/types';
import { create } from 'zustand';

import { CONVERSATION, type ChatMessage, type RichText } from './data';

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
  send: (text: string) => void;
  startNew: () => void;
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
}

export const useChatStore = create<ChatState>()((set) => ({
  messages: CONVERSATION.messages,
  send: (text) =>
    set((state) => ({
      messages: [...state.messages, { id: `u-${state.messages.length}`, role: 'user', text }],
      // Once the user writes, the page context gives way to the conversation.
      context: null,
      panelView: 'conversation',
    })),
  startNew: () => set({ messages: [], context: null, panelView: 'conversation' }),
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
}));
