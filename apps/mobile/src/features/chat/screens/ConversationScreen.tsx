import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AiDisclaimer } from '@/components/feedback';
import { Button, IconButton, Text } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useChatDocked } from '@/hooks/useChatDocked';
import { cn } from '@/lib/cn';
import { colors } from '@guara/ui-tokens';

import { assistantWith, isAssistantId } from '../assistants';
import {
  AssistantPickerSheet,
  ChatComposer,
  ChatHistoryPanel,
  ChatSideColumn,
  ChatThread,
  ConversationActions,
  NewConversationButton,
  useConversationCaption,
} from '../components';
import { SUGGESTIONS } from '../data';
import { useChatNavigation } from '../hooks/useChatNavigation';
import { useChatStore } from '../store';

/** Conversation with the team (full screen on phones, beside the rail on tablets). */
export function ConversationScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const scrollRef = useRef<ScrollView>(null);
  const docked = useChatDocked();
  const chat = useChatNavigation();
  // The same conversation as the side panel of wide tablets.
  const {
    send,
    stop,
    streaming,
    startNew,
    addressee: assistant,
    setAddressee: setAssistant,
    title,
    currentId,
  } = useChatStore();
  const updatedLabel = useConversationCaption();
  const { ask, assistant: askedAssistant } = useLocalSearchParams<{
    ask?: string;
    assistant?: string;
  }>();
  const [pickerOpen, setPickerOpen] = useState(false);

  // A question asked elsewhere ("Pergunte ao Pacu") arrives as params: apply each request once.
  const request = ask || askedAssistant ? `${askedAssistant ?? ''}|${ask ?? ''}` : null;
  const handledRequest = useRef<string | null>(null);
  useEffect(() => {
    if (!request || handledRequest.current === request) return;
    handledRequest.current = request;
    if (askedAssistant && isAssistantId(askedAssistant)) setAssistant(askedAssistant);
    if (ask) send(ask);
  }, [request, ask, askedAssistant, send, setAssistant]);

  const openHistory = () => router.navigate('/chat');
  const placeholder = assistant
    ? `Pergunte ${assistantWith('a', assistant)}`
    : isTablet
      ? 'Pergunte qualquer coisa sobre seu dinheiro'
      : 'Pergunte qualquer coisa';

  // "Sair da tela cheia": back to the page with the chat open over it.
  const exitFullScreen = (
    <IconButton
      icon="minimize"
      accessibilityLabel="Sair da tela cheia"
      onPress={chat.exitFullScreen}
    />
  );

  const header = isTablet ? (
    // Beside the history column the header matches its 68 dp so the divider lines up.
    <View
      className={cn(
        'flex-row items-center gap-2 border-b border-border pl-7 pr-5',
        docked ? 'h-[68px]' : 'h-[72px]',
      )}
    >
      <View className="flex-1">
        <Text
          serif
          weight="bold"
          size={22}
          tracking={-0.01}
          leading={1.3}
          accessibilityRole="header"
        >
          {title}
        </Text>
        <Text variant="caption" tone="subtle" leading={1.3}>
          {updatedLabel}
        </Text>
      </View>
      {docked ? null : (
        <Button variant="secondary" size="md" leftIcon="message" onPress={openHistory}>
          Histórico
        </Button>
      )}
      <NewConversationButton variant="icon" onPress={startNew} />
      <ConversationActions onDeleted={isTablet ? undefined : openHistory} />
      {exitFullScreen}
    </View>
  ) : (
    <View className="h-[60px] flex-row items-center gap-1 border-b border-border px-2">
      <IconButton
        icon="chevronLeft"
        accessibilityLabel="Voltar"
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      />
      <View className="min-w-0 flex-1 items-center">
        <Text size={16} weight="bold" leading={1.3} numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
        <Text size={12} tone="subtle" leading={1.3}>
          {updatedLabel}
        </Text>
      </View>
      <IconButton
        icon="message"
        accessibilityLabel="Histórico de conversas"
        onPress={openHistory}
      />
      {exitFullScreen}
      <ConversationActions onDeleted={isTablet ? undefined : openHistory} />
    </View>
  );

  const conversation = (
    <SafeAreaView
      edges={isTablet ? ['top', 'right'] : ['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: colors.background.DEFAULT }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {header}
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName={isTablet ? 'flex-grow gap-5 p-7' : 'flex-grow gap-4 p-4'}
          keyboardShouldPersistTaps="handled"
          // New messages and the answer being written scroll into view.
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          <ChatThread />
        </ScrollView>
        <SafeAreaView
          edges={['bottom']}
          className={
            isTablet
              ? 'gap-2 px-7 pb-7 pt-3'
              : 'border-t border-border bg-background px-3 pb-5 pt-2.5'
          }
        >
          <ChatComposer
            onSend={send}
            onPickAssistant={() => setPickerOpen(true)}
            suggestions={currentId === null && !streaming ? undefined : SUGGESTIONS}
            placeholder={placeholder}
            large={isTablet}
            streaming={streaming}
            onStop={stop}
          />
          <AiDisclaimer />
        </SafeAreaView>
      </KeyboardAvoidingView>
      <AssistantPickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        value={assistant}
        onChange={setAssistant}
      />
    </SafeAreaView>
  );

  if (!docked) return conversation;

  // Wide tablets: the history stays beside the conversation, in the same column as the side panel.
  return (
    <View className="flex-1 flex-row bg-background">
      <ChatSideColumn side="left" accessibilityLabel="Conversas">
        <ChatHistoryPanel
          currentId={currentId ?? undefined}
          onNew={startNew}
          onSelect={(conversationId) =>
            router.navigate({ pathname: '/chat/[conversationId]', params: { conversationId } })
          }
        />
      </ChatSideColumn>
      <View className="flex-1">{conversation}</View>
    </View>
  );
}
