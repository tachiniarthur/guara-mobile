import type { AssistantId } from '@guara/types';
import { create } from 'zustand';

import { formatDate } from '@guara/utils';

import { isOnline } from '@/lib/network';
import { useSubscriptionStore } from '@/stores';

import { streamReply, type ReplyEvent } from './api/reply';

import {
  CONVERSATION,
  CONVERSATION_GROUPS,
  type ChatFile,
  type ChatMessage,
  type ConversationGroup,
  type RichText,
} from './data';
import { appendPart, titleFrom } from './lib/conversation';

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
  /** When the conversation started ("Hoje, 14:32"); the day chip of the thread. */
  startedLabel: string;
  /** An answer is being written ("O Pacu está escrevendo…"). */
  streaming: boolean;
  /** "Parar a resposta". */
  stop: () => void;
  /** "Tentar de novo" on a message not sent or on an assistant that did not answer. */
  retry: (messageId: string) => void;
  /** "Apagar" a message not sent. */
  discard: (messageId: string) => void;
  /** "Perguntar à Capivara" when an assistant did not answer. */
  askCapivara: (messageId: string) => void;
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

/** "Hoje, 14:40". */
const nowLabel = () => `Hoje, ${formatDate(new Date(), 'HH:mm')}`;

type UserMessage = Extract<ChatMessage, { role: 'user' }>;
type AssistantMessage = Extract<ChatMessage, { role: 'assistant' }>;

/** The answer being written; "Parar a resposta" aborts it. */
let current: AbortController | null = null;

/** Puts a new conversation at the top of "Hoje". */
function addToToday(groups: ConversationGroup[], item: ConversationGroup['items'][number]) {
  const today = groups.find((group) => group.label === 'Hoje');
  if (!today) return [{ label: 'Hoje', items: [item] }, ...groups];
  return groups.map((group) =>
    group === today ? { ...group, items: [item, ...group.items] } : group,
  );
}

const updateItem = (
  groups: ConversationGroup[],
  id: string,
  patch: (item: ConversationGroup['items'][number]) => Partial<ConversationGroup['items'][number]>,
) =>
  groups.map((group) => ({
    ...group,
    items: group.items.map((item) => (item.id === id ? { ...item, ...patch(item) } : item)),
  }));

export const useChatStore = create<ChatState>()((set, get) => {
  const updateMessage = (id: string, patch: (message: ChatMessage) => ChatMessage) =>
    set((state) => ({
      messages: state.messages.map((message) => (message.id === id ? patch(message) : message)),
    }));

  /** Asks the team (or `assistant`) and streams the answer under the question. */
  const answer = async (question: UserMessage, assistant: AssistantId | null) => {
    current?.abort();
    const abort = new AbortController();
    current = abort;
    const replyId = `a-${question.id}-${Date.now()}`;
    set({ streaming: true });
    const onEvent = (event: ReplyEvent) => {
      if (event.type === 'start') {
        const reply: AssistantMessage = {
          id: replyId,
          role: 'assistant',
          assistant: event.assistant,
          area: event.area,
          blocks: [],
          status: 'streaming',
          // Asked to the whole team, another assistant answers through the Capivara.
          ...(assistant === null && event.assistant !== 'capivara'
            ? { routedBy: 'capivara' as const }
            : null),
        };
        set((state) => ({ messages: [...state.messages, reply] }));
      } else if (event.type === 'block') {
        updateMessage(replyId, (message) =>
          message.role === 'assistant'
            ? { ...message, blocks: [...message.blocks, event.block] }
            : message,
        );
      } else if (event.type === 'delta') {
        updateMessage(replyId, (message) =>
          message.role === 'assistant'
            ? { ...message, blocks: appendPart(message.blocks, event.part) }
            : message,
        );
      } else if (event.type === 'done') {
        updateMessage(replyId, (message) =>
          message.role === 'assistant' ? { ...message, status: undefined } : message,
        );
      } else {
        set((state) => {
          const messages = state.messages.filter((message) => message.id !== replyId);
          if (event.code === 'network') {
            return {
              messages: messages.map((message) =>
                message.id === question.id && message.role === 'user'
                  ? { ...message, status: 'failed' as const }
                  : message,
              ),
            };
          }
          return {
            messages: [
              ...messages,
              {
                id: `x-${question.id}-${Date.now()}`,
                role: 'unavailable' as const,
                assistant: event.assistant,
                area: event.area,
                questionId: question.id,
                ...(assistant === null && event.assistant !== 'capivara'
                  ? { routedBy: 'capivara' as const }
                  : null),
              },
            ],
          };
        });
      }
    };
    await streamReply({ content: question.text, assistant }, { signal: abort.signal, onEvent });
    if (current === abort) {
      current = null;
      set({ streaming: false });
    }
  };

  /** Sends a stored question (new or again): offline it stays as "Não enviada". */
  const deliver = async (question: UserMessage, assistant: AssistantId | null) => {
    if (!(await isOnline())) {
      updateMessage(question.id, (message) =>
        message.role === 'user' ? { ...message, status: 'failed' } : message,
      );
      return;
    }
    // Each question counts toward the plan's monthly limit.
    useSubscriptionStore.getState().countQuestion();
    await answer(question, assistant);
  };

  return {
    messages: CONVERSATION.messages,
    currentId: CONVERSATION.id,
    title: CONVERSATION.title,
    startedLabel: CONVERSATION.updatedLabel,
    streaming: false,
    groups: CONVERSATION_GROUPS,
    send: (text, attachment) => {
      const question: UserMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        text,
        ...(attachment ? { attachment } : null),
      };
      set((state) => {
        // The first question names a new conversation and puts it in the history.
        const fresh = state.currentId === null && state.messages.length === 0;
        const id = fresh ? `conversa-${Date.now()}` : state.currentId;
        const title = fresh ? titleFrom(text || (attachment?.name ?? NEW_TITLE)) : state.title;
        return {
          messages: [...state.messages, question],
          currentId: id,
          title,
          startedLabel: fresh ? nowLabel() : state.startedLabel,
          groups:
            fresh && id
              ? addToToday(state.groups, {
                  id,
                  title,
                  preview: text || (attachment?.name ?? ''),
                  time: formatDate(new Date(), 'HH:mm'),
                })
              : state.groups,
          // Once the user writes, the page context gives way to the conversation.
          context: null,
          panelView: 'conversation',
        };
      });
      void deliver(question, get().addressee);
    },
    stop: () => {
      current?.abort();
      current = null;
      set((state) => ({
        streaming: false,
        messages: state.messages.map((message) =>
          message.role === 'assistant' && message.status === 'streaming'
            ? { ...message, status: 'stopped' }
            : message,
        ),
      }));
    },
    retry: (messageId) => {
      const { messages, addressee } = get();
      const target = messages.find((message) => message.id === messageId);
      if (!target) return;
      const questionId = target.role === 'unavailable' ? target.questionId : target.id;
      const question = messages.find(
        (message): message is UserMessage => message.id === questionId && message.role === 'user',
      );
      if (!question) return;
      const again: UserMessage = { ...question, status: undefined };
      set((state) => ({
        messages: state.messages
          .filter((message) => message.id !== messageId || message.role === 'user')
          .map((message) => (message.id === question.id ? again : message)),
      }));
      // An unavailable assistant is asked again the same way: directly, or through the team.
      const assistant =
        target.role === 'unavailable' ? (target.routedBy ? null : target.assistant) : addressee;
      void deliver(again, assistant);
    },
    discard: (messageId) =>
      set((state) => ({ messages: state.messages.filter((message) => message.id !== messageId) })),
    askCapivara: (messageId) => {
      const target = get().messages.find((message) => message.id === messageId);
      if (target?.role !== 'unavailable') return;
      const question = get().messages.find(
        (message): message is UserMessage =>
          message.id === target.questionId && message.role === 'user',
      );
      if (!question) return;
      set((state) => ({ messages: state.messages.filter((message) => message.id !== messageId) }));
      void deliver(question, 'capivara');
    },
    startNew: () => {
      current?.abort();
      current = null;
      set({
        messages: [],
        currentId: null,
        title: NEW_TITLE,
        startedLabel: '',
        streaming: false,
        context: null,
        panelView: 'conversation',
      });
    },
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
  };
});
