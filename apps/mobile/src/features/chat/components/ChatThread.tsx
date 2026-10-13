import { Fragment } from 'react';

import { useChatStore } from '../store';

import { ChatMessageView, DayChip, OfflineNote } from './MessageBubbles';
import { NewConversationIntro } from './NewConversationIntro';

/**
 * Messages of the open conversation with their states (writing, not sent, unavailable), or the
 * new conversation intro. Shared by the full-screen page and the chat panel.
 */
export function ChatThread({ compact = false }: { compact?: boolean }) {
  const messages = useChatStore((state) => state.messages);
  const startedLabel = useChatStore((state) => state.startedLabel);
  const send = useChatStore((state) => state.send);
  const retry = useChatStore((state) => state.retry);
  const discard = useChatStore((state) => state.discard);
  const askCapivara = useChatStore((state) => state.askCapivara);

  if (messages.length === 0) return <NewConversationIntro onAsk={send} compact={compact} />;

  // The offline note sits under the last message that was not sent.
  const lastFailed = messages.findLast(
    (message) => message.role === 'user' && message.status === 'failed',
  )?.id;
  return (
    <>
      {startedLabel ? <DayChip label={startedLabel} /> : null}
      {messages.map((message) => (
        <Fragment key={message.id}>
          <ChatMessageView
            message={message}
            onRetry={retry}
            onDiscard={discard}
            onAskCapivara={askCapivara}
          />
          {message.id === lastFailed ? <OfflineNote /> : null}
        </Fragment>
      ))}
    </>
  );
}
