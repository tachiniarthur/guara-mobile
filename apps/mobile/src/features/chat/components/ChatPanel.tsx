import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AiDisclaimer } from '@/components/feedback';
import { Chip, IconButton, Span, Text } from '@/components/ui';
import { conversationHref } from '@/navigation/destinations';

import { ASSISTANTS } from '../assistants';
import { CONVERSATION } from '../data';
import { useChatStore } from '../store';

import { AssistantAvatar } from './AssistantAvatar';
import { AssistantPickerSheet } from './AssistantPickerSheet';
import { ChatComposer } from './ChatComposer';
import { ChatHistoryPanel } from './ChatHistoryPanel';
import { ChatColumnHeader, ChatSideColumn } from './ChatSideColumn';
import { ChatMessageView } from './MessageBubbles';

/**
 * Chat beside the pages on wide tablets: the history or the open conversation, always in
 * the same fixed-width column (see `ChatSideColumn`).
 */
export function ChatPanel() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const {
    panelView,
    context,
    messages,
    send,
    startNew,
    closePanel,
    showHistory,
    showConversation,
    addressee,
    setAddressee,
    title,
    currentId,
  } = useChatStore();
  const [pickerOpen, setPickerOpen] = useState(false);

  const count = messages.length;
  useEffect(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, [count]);

  if (panelView === 'history') {
    return (
      <ChatSideColumn side="right" accessibilityLabel="Conversas">
        <ChatHistoryPanel
          currentId={currentId ?? undefined}
          onSelect={showConversation}
          onNew={startNew}
          onClose={closePanel}
        />
      </ChatSideColumn>
    );
  }

  const speaker = context?.assistant ?? null;
  const placeholder =
    context?.placeholder ??
    (addressee ? `Pergunte ao ${ASSISTANTS[addressee].name}` : 'Pergunte qualquer coisa');

  return (
    <ChatSideColumn side="right" accessibilityLabel="Conversa">
      <ChatColumnHeader>
        <IconButton icon="chevronLeft" accessibilityLabel="Ver conversas" onPress={showHistory} />
        {speaker ? <AssistantAvatar assistant={speaker} size={34} /> : null}
        <View className="min-w-0 flex-1">
          <Text size={15} weight="bold" leading={1.3} numberOfLines={1} accessibilityRole="header">
            {speaker ? ASSISTANTS[speaker].name : title}
          </Text>
          <Text size={12} tone="subtle" leading={1.3} numberOfLines={1}>
            {context?.subtitle ??
              (currentId === CONVERSATION.id ? CONVERSATION.updatedLabel : 'Agora')}
          </Text>
        </View>
        <IconButton
          icon="arrowUpRight"
          accessibilityLabel="Abrir conversa em tela cheia"
          onPress={() => router.navigate(conversationHref())}
        />
        <IconButton icon="close" accessibilityLabel="Fechar conversa" onPress={closePanel} />
      </ChatColumnHeader>
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 16 }}
      >
        {context ? (
          <View className="gap-4">
            <View className="gap-2.5">
              <View className="flex-row items-center gap-2">
                <AssistantAvatar assistant={context.assistant} size={28} />
                <Text size={14} weight="bold">
                  {ASSISTANTS[context.assistant].name}
                </Text>
                <Text size={12} tone="subtle">
                  · {ASSISTANTS[context.assistant].area}
                </Text>
              </View>
              <Text size={15} leading={1.6}>
                {context.intro.map((part, index) =>
                  typeof part === 'string' ? (
                    part
                  ) : (
                    <Span key={index} weight="bold">
                      {part.strong}
                    </Span>
                  ),
                )}
              </Text>
              <Text size={15} leading={1.6}>
                {context.question}
              </Text>
            </View>
            <View className="items-start gap-2">
              {context.suggestions.map((suggestion) => (
                <Chip
                  key={suggestion}
                  label={suggestion}
                  size={36}
                  appearance="filled"
                  selected={false}
                  onPress={() => send(suggestion)}
                />
              ))}
            </View>
          </View>
        ) : (
          messages.map((message) => <ChatMessageView key={message.id} message={message} />)
        )}
      </ScrollView>
      <View className="gap-2 px-3.5 pt-3" style={{ paddingBottom: insets.bottom + 16 }}>
        <ChatComposer
          onSend={send}
          onPickAssistant={() => setPickerOpen(true)}
          placeholder={placeholder}
        />
        <AiDisclaimer className="justify-center" />
      </View>
      <AssistantPickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        value={addressee}
        onChange={setAddressee}
      />
    </ChatSideColumn>
  );
}
