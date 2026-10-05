import { View } from 'react-native';

import { Span, Text } from '@/components/ui';

import { ASSISTANTS } from '../assistants';
import type { AssistantBlock, ChatMessage, RichText } from '../data';

import { AssistantAvatar } from './AssistantAvatar';
import { ChatBudgetCard } from './ChatBudgetCard';

function Rich({ content }: { content: RichText }) {
  return (
    <Text variant="lead">
      {content.map((part, index) =>
        typeof part === 'string' ? (
          part
        ) : (
          <Span key={index} weight="bold">
            {part.strong}
          </Span>
        ),
      )}
    </Text>
  );
}

function Block({ block }: { block: AssistantBlock }) {
  if (block.type === 'text') return <Rich content={block.content} />;
  return <ChatBudgetCard {...block} />;
}

/** User message: Tucano bubble aligned to the right. */
export function UserBubble({ text }: { text: string }) {
  return (
    <View className="flex-row justify-end">
      <View
        className="max-w-[320px] bg-brand px-3.5 py-2.5"
        style={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 6,
        }}
      >
        <Text size={15} weight="medium" tone="inverse">
          {text}
        </Text>
      </View>
    </View>
  );
}

/** Assistant answer: portrait, name and area, then text and data blocks. */
export function AssistantAnswer({
  message,
}: {
  message: Extract<ChatMessage, { role: 'assistant' }>;
}) {
  const meta = ASSISTANTS[message.assistant];
  return (
    <View className="gap-2.5" accessibilityLabel={`${meta.name} respondeu`}>
      <View className="flex-row items-center gap-2">
        <AssistantAvatar assistant={message.assistant} size={28} />
        <Text size={14} weight="bold">
          {meta.name}
        </Text>
        <Text size={12} tone="subtle">
          · {message.area}
        </Text>
      </View>
      {message.blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </View>
  );
}

export function ChatMessageView({ message }: { message: ChatMessage }) {
  return message.role === 'user' ? (
    <UserBubble text={message.text} />
  ) : (
    <AssistantAnswer message={message} />
  );
}
