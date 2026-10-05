import { colors, fontFamily } from '@guara/ui-tokens';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { IconButton, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';

export interface ChatComposerProps {
  onSend: (text: string) => void;
  onPickAssistant: () => void;
  suggestions?: readonly string[];
  placeholder?: string;
  /** Tablet: 40-tall suggestions. */
  large?: boolean;
}

/** Suggestions + pill field with attach, "@" (pick an assistant), voice and send. */
export function ChatComposer({
  onSend,
  onPickAssistant,
  suggestions = [],
  placeholder = 'Pergunte qualquer coisa',
  large = false,
}: ChatComposerProps) {
  const [text, setText] = useState('');

  const send = (value = text) => {
    const message = value.trim();
    if (!message) return;
    haptics.impact();
    onSend(message);
    setText('');
  };

  return (
    <View className="gap-2">
      {suggestions.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          accessibilityLabel="Sugestões"
          contentContainerClassName="gap-2"
          keyboardShouldPersistTaps="handled"
        >
          {suggestions.map((suggestion) => (
            <Pressable
              key={suggestion}
              accessibilityRole="button"
              onPress={() => send(suggestion)}
              className={cn(
                'justify-center rounded-full border border-border-strong px-4 active:bg-surface-pressed',
                large ? 'h-10' : 'h-9',
              )}
            >
              <Text size={14}>{suggestion}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      <View className="min-h-14 flex-row items-center gap-0.5 rounded-full border border-border-strong bg-surface-input p-1.5">
        <IconButton icon="paperclip" accessibilityLabel="Anexar arquivo" />
        <IconButton
          icon="atSign"
          accessibilityLabel="Falar com um bicho específico"
          onPress={onPickAssistant}
        />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.foreground.subtle}
          selectionColor={colors.brand.DEFAULT}
          cursorColor={colors.brand.DEFAULT}
          accessibilityLabel="Mensagem"
          returnKeyType="send"
          onSubmitEditing={() => send()}
          className="h-11 min-w-0 flex-1 pl-1 text-foreground"
          style={{ fontFamily: fontFamily.regular, fontSize: 15 }}
        />
        <IconButton icon="mic" accessibilityLabel="Falar" />
        <IconButton
          icon="arrowRight"
          variant="primary"
          accessibilityLabel="Enviar mensagem"
          onPress={() => send()}
        />
      </View>
    </View>
  );
}
