import type { AssistantId } from '@guara/types';
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

import { ASSISTANTS } from '../assistants';
import {
  AssistantPickerSheet,
  ChatComposer,
  ChatHistoryPanel,
  ChatMessageView,
  ChatSideColumn,
  ConversationActions,
  NewConversationButton,
} from '../components';
import { CONVERSATION, SUGGESTIONS } from '../data';
import { useChatStore } from '../store';

/** Conversation with the team (full screen on phones, beside the rail on tablets). */
export function ConversationScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const scrollRef = useRef<ScrollView>(null);
  const docked = useChatDocked();
  // The same conversation as the side panel of wide tablets.
  const {
    messages,
    send,
    startNew,
    addressee: assistant,
    setAddressee: setAssistant,
    title,
    currentId,
  } = useChatStore();
  const updatedLabel = currentId === CONVERSATION.id ? CONVERSATION.updatedLabel : 'Agora';
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
    if (askedAssistant && askedAssistant in ASSISTANTS) setAssistant(askedAssistant as AssistantId);
    if (ask) send(ask);
  }, [request, ask, askedAssistant, send, setAssistant]);

  // New messages scroll into view.
  const count = messages.length;
  useEffect(() => {
    if (count > CONVERSATION.messages.length) {
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  }, [count]);

  const openHistory = () => router.navigate('/chat');
  const placeholder = assistant
    ? `Pergunte ao ${ASSISTANTS[assistant].name}`
    : isTablet
      ? 'Pergunte qualquer coisa sobre seu dinheiro'
      : 'Pergunte qualquer coisa';

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
          contentContainerClassName={isTablet ? 'gap-5 p-7' : 'gap-4 p-4'}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message) => (
            <ChatMessageView key={message.id} message={message} />
          ))}
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
            suggestions={SUGGESTIONS}
            placeholder={placeholder}
            large={isTablet}
          />
          {isTablet ? <AiDisclaimer className="justify-center" /> : null}
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
