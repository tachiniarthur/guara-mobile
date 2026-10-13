import { Pressable, View } from 'react-native';

import { Span, Text } from '@/components/ui';
import { useUserStore } from '@/stores';

import { ASSISTANT_ORDER, ASSISTANTS } from '../assistants';
import { STARTERS } from '../data';

import { AssistantAvatar } from './AssistantAvatar';

/**
 * "Nova conversa": the team ready, the Capivara's hello and a question for each assistant.
 * The panel (`compact`) offers the first two.
 */
export function NewConversationIntro({
  onAsk,
  compact = false,
}: {
  onAsk: (question: string) => void;
  compact?: boolean;
}) {
  const name = useUserStore((state) => state.name);
  const team = ASSISTANT_ORDER.filter((id) => id !== 'capivara');
  const starters = compact ? STARTERS.slice(0, 2) : STARTERS;
  return (
    <View className="mt-auto gap-4">
      <View
        accessible
        accessibilityLabel={`${team.length} assistentes prontos`}
        className="flex-row items-center gap-1.5"
      >
        {team.map((id) => (
          <AssistantAvatar key={id} assistant={id} size={30} />
        ))}
        <Text size={12} tone="subtle" className="ml-1">
          {`${team.length} assistentes prontos`}
        </Text>
      </View>
      <View className="gap-2">
        <View className="flex-row items-center gap-2">
          <AssistantAvatar assistant="capivara" size={28} />
          <Text size={14} weight="bold">
            {ASSISTANTS.capivara.name}
          </Text>
          <Text size={12} tone="subtle">
            · Coordena a turma
          </Text>
        </View>
        <Text size={15} leading={1.6}>
          {`Oi, ${name}! Eu sou a Capivara. Pergunte qualquer coisa sobre seu dinheiro que eu chamo quem entende do assunto. Se preferir, digite `}
          <Span weight="bold">@</Span> e escolha um bicho.
        </Text>
      </View>
      <Text size={13} weight="bold" tone="muted">
        Comece por aqui
      </Text>
      <View className="gap-2">
        {starters.map((starter) => (
          <Pressable
            key={starter.question}
            accessibilityRole="button"
            accessibilityLabel={`${ASSISTANTS[starter.assistant].name}: ${starter.question}`}
            onPress={() => onAsk(starter.question)}
            className="min-h-[52px] flex-row items-center gap-2.5 rounded-16 border border-border-strong bg-surface px-3.5 py-3 active:bg-surface-pressed"
          >
            <AssistantAvatar assistant={starter.assistant} size={28} />
            <View className="min-w-0 flex-1">
              <Text size={12} tone="subtle">
                {ASSISTANTS[starter.assistant].name}
              </Text>
              <Text size={14} weight="semibold" leading={1.4}>
                {starter.question}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
      <Text size={12} tone="subtle">
        Eles consultam seus dados do Guará para responder e nunca inventam números.
      </Text>
    </View>
  );
}
