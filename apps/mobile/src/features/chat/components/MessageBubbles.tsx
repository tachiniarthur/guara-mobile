import type { AssistantId } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { Pressable, View } from 'react-native';

import { Badge, Button, InfoNote, Span, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

import { ASSISTANTS, assistantWith } from '../assistants';
import type { AssistantBlock, ChatFile, ChatMessage, RichText } from '../data';

import { AssistantAvatar } from './AssistantAvatar';
import { ChatBudgetCard } from './ChatBudgetCard';
import { AttachmentChip } from './ComposerAttachments';

type AssistantMessage = Extract<ChatMessage, { role: 'assistant' }>;
type UnavailableMessage = Extract<ChatMessage, { role: 'unavailable' }>;

/** Blinking-free cursor at the end of the text being written. */
function Cursor() {
  return (
    <View
      className="ml-0.5 h-[18px] w-[9px] bg-brand"
      style={{ borderRadius: 2, transform: [{ translateY: 3 }] }}
    />
  );
}

function Rich({ content, writing = false }: { content: RichText; writing?: boolean }) {
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
      {writing ? <Cursor /> : null}
    </Text>
  );
}

function Block({ block, writing }: { block: AssistantBlock; writing: boolean }) {
  if (block.type === 'text') return <Rich content={block.content} writing={writing} />;
  return <ChatBudgetCard {...block} />;
}

/** "Hoje, 14:40" above the first message. */
export function DayChip({ label }: { label: string }) {
  return (
    <View className="items-center">
      <View className="rounded-full bg-surface-muted px-3.5 py-1">
        <Text size={12} tone="subtle">
          {label}
        </Text>
      </View>
    </View>
  );
}

/** User message: Tucano bubble aligned to the right (dashed in Urucum when not sent). */
export function UserBubble({
  text,
  attachment,
  failed = false,
  onRetry,
  onDiscard,
}: {
  text: string;
  attachment?: ChatFile;
  failed?: boolean;
  onRetry?: () => void;
  onDiscard?: () => void;
}) {
  return (
    <View className="items-end gap-1.5">
      {attachment ? (
        <View className="w-full max-w-[320px]">
          <AttachmentChip file={attachment} />
        </View>
      ) : null}
      {text ? (
        <View className="flex-row justify-end">
          <View
            className={cn(
              'max-w-[320px] px-3.5 py-2.5',
              failed ? 'border-[1.5px] border-dashed border-negative' : 'bg-brand',
            )}
            style={{
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 6,
            }}
          >
            <Text size={15} weight="medium" tone={failed ? 'default' : 'inverse'}>
              {text}
            </Text>
          </View>
        </View>
      ) : null}
      {failed ? (
        <View
          accessibilityRole="alert"
          className="flex-row flex-wrap items-center justify-end gap-2.5"
        >
          <Text size={13} weight="bold" tone="negative">
            Não enviada
          </Text>
          {onRetry ? (
            <Pressable
              accessibilityRole="button"
              onPress={onRetry}
              className="h-9 justify-center rounded-full border border-border-strong bg-surface px-3.5 active:bg-surface-pressed"
            >
              <Text size={13} weight="bold">
                Tentar de novo
              </Text>
            </Pressable>
          ) : null}
          {onDiscard ? (
            <Pressable
              accessibilityRole="button"
              onPress={onDiscard}
              className="h-9 justify-center px-2"
            >
              <Text size={13} tone="muted" underline>
                Apagar
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/** "A Capivara chamou o Pacu · Investimentos". */
export function RoutedNote({
  by,
  assistant,
  area,
}: {
  by: AssistantId;
  assistant: AssistantId;
  area: string;
}) {
  const { article, name } = ASSISTANTS[by];
  return (
    <View className="flex-row items-center gap-2">
      <AssistantAvatar assistant={by} size={20} />
      <Text size={12} tone="subtle" className="flex-1">
        {`${article === 'a' ? 'A' : 'O'} ${name} chamou ${ASSISTANTS[assistant].article} `}
        <Span weight="bold" tone="muted">
          {ASSISTANTS[assistant].name}
        </Span>
        {` · ${area}`}
      </Text>
    </View>
  );
}

/** "O Pacu está escrevendo…" with three dots. */
function Writing({ assistant }: { assistant: AssistantId }) {
  const { article, name } = ASSISTANTS[assistant];
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLiveRegion="polite"
      className="flex-row items-center gap-2"
    >
      {[colors.foreground.muted, colors.foreground.subtle, colors.border.strong].map((color) => (
        <View key={color} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      ))}
      <Text size={12} tone="subtle">
        {`${article === 'a' ? 'A' : 'O'} ${name} está escrevendo…`}
      </Text>
    </View>
  );
}

/** Assistant answer: portrait, name and area, then text and data blocks. */
export function AssistantAnswer({ message }: { message: AssistantMessage }) {
  const meta = ASSISTANTS[message.assistant];
  const writing = message.status === 'streaming';
  return (
    <View className="gap-2.5">
      {message.routedBy ? (
        <RoutedNote by={message.routedBy} assistant={message.assistant} area={message.area} />
      ) : null}
      <View
        className="gap-2.5"
        accessibilityLabel={writing ? `${meta.name} está respondendo` : `${meta.name} respondeu`}
      >
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
          <Block
            key={index}
            block={block}
            writing={writing && index === message.blocks.length - 1}
          />
        ))}
        {writing ? <Writing assistant={message.assistant} /> : null}
        {message.status === 'stopped' ? (
          <Text size={12} tone="subtle">
            Resposta interrompida.
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/** "O Pacu não está respondendo agora": the question is kept and can be asked again. */
export function UnavailableCard({
  message,
  onRetry,
  onAskCapivara,
}: {
  message: UnavailableMessage;
  onRetry: () => void;
  onAskCapivara: () => void;
}) {
  const { article, name } = ASSISTANTS[message.assistant];
  return (
    <View className="gap-2.5">
      {message.routedBy ? (
        <RoutedNote by={message.routedBy} assistant={message.assistant} area={message.area} />
      ) : null}
      <View
        accessibilityRole="alert"
        className="gap-2.5 rounded-18 border border-negative-border bg-negative-muted px-4 py-3.5"
      >
        <View className="flex-row items-center gap-2.5">
          <AssistantAvatar assistant={message.assistant} size={28} />
          <Text size={14} weight="bold" className="min-w-0 flex-1">
            {`${article === 'a' ? 'A' : 'O'} ${name} não está respondendo agora`}
          </Text>
          <Badge label="Indisponível" tone="negative" />
        </View>
        <Text size={14} leading={1.55}>
          Sua pergunta ficou guardada. Tentamos de novo sozinhos em alguns minutos e avisamos quando
          a resposta chegar. Seus dados não foram afetados.
        </Text>
        <View className="flex-row flex-wrap items-center gap-2">
          <Button variant="secondary" size="md" className="h-10 px-4.5" onPress={onRetry}>
            Tentar de novo
          </Button>
          {message.assistant === 'capivara' ? null : (
            <Button variant="ghost" size="md" className="h-10 px-4.5" onPress={onAskCapivara}>
              {`Perguntar ${assistantWith('a', 'capivara')}`}
            </Button>
          )}
        </View>
      </View>
    </View>
  );
}

/** "Sem conexão. A mensagem fica aqui até você tentar de novo; nada se perde." */
export function OfflineNote() {
  return (
    <InfoNote icon="alertTriangle" tone="warning" size={13} iconColor={colors.brand.DEFAULT}>
      Sem conexão. A mensagem fica aqui até você tentar de novo; nada se perde.
    </InfoNote>
  );
}

export function ChatMessageView({
  message,
  onRetry,
  onDiscard,
  onAskCapivara,
}: {
  message: ChatMessage;
  onRetry?: (id: string) => void;
  onDiscard?: (id: string) => void;
  onAskCapivara?: (id: string) => void;
}) {
  if (message.role === 'user') {
    return (
      <UserBubble
        text={message.text}
        attachment={message.attachment}
        failed={message.status === 'failed'}
        onRetry={onRetry ? () => onRetry(message.id) : undefined}
        onDiscard={onDiscard ? () => onDiscard(message.id) : undefined}
      />
    );
  }
  if (message.role === 'unavailable') {
    return (
      <UnavailableCard
        message={message}
        onRetry={() => onRetry?.(message.id)}
        onAskCapivara={() => onAskCapivara?.(message.id)}
      />
    );
  }
  return <AssistantAnswer message={message} />;
}
