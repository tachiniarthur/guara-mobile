import { View } from 'react-native';

import { IconButton, Text } from '@/components/ui';

import { assistantWith } from '../assistants';
import { CONVERSATION } from '../data';
import { useChatStore } from '../store';

/** "Hoje, 14:32 · com o Tamanduá": when it was updated and who answered last. */
export function useConversationCaption(): string {
  const currentId = useChatStore((state) => state.currentId);
  const messages = useChatStore((state) => state.messages);
  const updated = currentId === CONVERSATION.id ? CONVERSATION.updatedLabel : 'Agora';
  const last = messages.findLast((message) => message.role === 'assistant');
  return last?.role === 'assistant'
    ? `${updated} · ${assistantWith('com', last.assistant)}`
    : updated;
}

/**
 * Header of the chat opened over a page: title, caption and the history, full screen and close
 * buttons.
 */
export function ChatPanelHeader({
  onHistory,
  onFullScreen,
  onClose,
}: {
  onHistory: () => void;
  onFullScreen: () => void;
  onClose: () => void;
}) {
  const title = useChatStore((state) => state.title);
  const caption = useConversationCaption();
  return (
    <View className="min-h-16 flex-row items-center gap-1 border-b border-border pl-[18px] pr-2">
      <View className="min-w-0 flex-1">
        <Text
          serif
          weight="bold"
          size={18}
          leading={1.3}
          numberOfLines={1}
          accessibilityRole="header"
        >
          {title}
        </Text>
        <Text size={12} tone="subtle" leading={1.3} numberOfLines={1}>
          {caption}
        </Text>
      </View>
      <IconButton icon="clock" accessibilityLabel="Histórico de conversas" onPress={onHistory} />
      <IconButton icon="maximize" accessibilityLabel="Abrir em tela cheia" onPress={onFullScreen} />
      <IconButton icon="close" accessibilityLabel="Fechar o chat" onPress={onClose} />
    </View>
  );
}
