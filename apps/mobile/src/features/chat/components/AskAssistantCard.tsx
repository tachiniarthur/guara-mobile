import type { AssistantId } from '@guara/types';
import { colors, fontFamily } from '@guara/ui-tokens';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Icon, IconButton, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { conversationHref } from '@/navigation/destinations';

import { assistantWith } from '../assistants';

import { AssistantAvatar } from './AssistantAvatar';

export interface AskAssistantCardProps {
  assistant: AssistantId;
  /** "sobre este ativo", "sobre esta simulação". */
  subject: string;
  questions: readonly string[];
  /** Divider under the header (asset page). */
  divided?: boolean;
}

/** Suggested questions and a field that open the conversation with an assistant. */
export function AskAssistantCard({
  assistant,
  subject,
  questions,
  divided = false,
}: AskAssistantCardProps) {
  const router = useRouter();
  const [text, setText] = useState('');
  const ask = (question?: string) =>
    router.navigate(conversationHref(undefined, { ask: question, assistant }));
  const send = () => {
    const question = text.trim();
    setText('');
    ask(question || undefined);
  };

  return (
    <View className="min-w-0 gap-4 rounded-24 border border-border bg-surface p-5">
      <View
        className={cn(
          'flex-row items-center gap-2.5',
          divided && '-mx-5 border-b border-border px-5 pb-3.5',
        )}
      >
        <AssistantAvatar assistant={assistant} size={28} />
        <Text size={16} weight="bold" accessibilityRole="header">
          {`Pergunte ${assistantWith('a', assistant)}`}
        </Text>
        <Text size={13} tone="subtle" className="shrink">
          {subject}
        </Text>
      </View>
      <View style={{ marginTop: -8 }}>
        {questions.map((question) => (
          <Pressable
            key={question}
            accessibilityRole="link"
            accessibilityHint={`Abre a conversa ${assistantWith('com', assistant)}`}
            onPress={() => ask(question)}
            className="min-h-11 flex-row items-center justify-between gap-3 border-b border-border py-3 active:opacity-80"
          >
            <Text size={15} weight="semibold" className="flex-1">
              {question}
            </Text>
            <Icon name="arrowUpRight" size={16} color={colors.foreground.subtle} />
          </Pressable>
        ))}
      </View>
      <View className="mt-1 min-h-12 flex-row items-center gap-2 rounded-full border border-border-strong bg-surface-input py-1 pl-4 pr-1">
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Pergunte o que quiser…"
          placeholderTextColor={colors.foreground.subtle}
          selectionColor={colors.brand.DEFAULT}
          cursorColor={colors.brand.DEFAULT}
          accessibilityLabel={`Pergunta ${assistantWith('a', assistant)}`}
          returnKeyType="send"
          onSubmitEditing={send}
          className="h-10 min-w-0 flex-1 text-foreground"
          style={{ fontFamily: fontFamily.regular, fontSize: 15 }}
        />
        <IconButton
          icon="arrowUp"
          variant="primary"
          size={40}
          accessibilityLabel="Enviar pergunta"
          onPress={send}
        />
      </View>
    </View>
  );
}
