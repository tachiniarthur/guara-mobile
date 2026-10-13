import { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AiDisclaimer } from '@/components/feedback';
import { Chip, Span, Text } from '@/components/ui';

import { ASSISTANTS, assistantWith } from '../assistants';
import { useChatStore } from '../store';

import { AssistantAvatar } from './AssistantAvatar';
import { AssistantPickerSheet } from './AssistantPickerSheet';
import { ChatComposer } from './ChatComposer';
import { ChatThread } from './ChatThread';

/**
 * Messages, composer and the AI notice of the chat opened over a page (docked panel, tablet
 * panel and phone sheet). A page context ("Lendo este relatório com você") replaces the messages
 * until the user writes.
 */
export function ChatPanelBody({
  suggestions,
  bottomInset = 0,
}: {
  suggestions?: readonly string[];
  /** Safe area under the composer. */
  bottomInset?: number;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const context = useChatStore((state) => state.context);
  const isNew = useChatStore((state) => state.messages.length === 0);
  const send = useChatStore((state) => state.send);
  const stop = useChatStore((state) => state.stop);
  const streaming = useChatStore((state) => state.streaming);
  const addressee = useChatStore((state) => state.addressee);
  const setAddressee = useChatStore((state) => state.setAddressee);
  const [pickerOpen, setPickerOpen] = useState(false);

  const placeholder =
    context?.placeholder ??
    (addressee ? `Pergunte ${assistantWith('a', addressee)}` : 'Pergunte qualquer coisa');

  return (
    <>
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 16, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        // New messages and the answer being written scroll into view.
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
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
          <ChatThread compact />
        )}
      </ScrollView>
      <View
        className="gap-2 border-t border-border bg-background px-3 pt-2.5"
        style={{ paddingBottom: bottomInset + 20 }}
      >
        <ChatComposer
          onSend={send}
          onPickAssistant={() => setPickerOpen(true)}
          suggestions={context || isNew ? undefined : suggestions}
          placeholder={placeholder}
          streaming={streaming}
          onStop={stop}
        />
        <AiDisclaimer />
      </View>
      <AssistantPickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        value={addressee}
        onChange={setAddressee}
      />
    </>
  );
}
