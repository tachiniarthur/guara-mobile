import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, Text } from '@/components/ui';

import { ASSISTANTS } from '../assistants';
import { useChatNavigation } from '../hooks/useChatNavigation';
import { useChatStore } from '../store';

import { AssistantAvatar } from './AssistantAvatar';
import { ChatHistoryPanel } from './ChatHistoryPanel';
import { ChatPanelBody } from './ChatPanelBody';
import { useConversationCaption } from './ChatPanelHeader';
import { ChatColumnHeader, ChatSideColumn } from './ChatSideColumn';

/**
 * Chat beside the pages on wide tablets: the history or the open conversation, always in
 * the same fixed-width column (see `ChatSideColumn`).
 */
export function ChatPanel() {
  const chat = useChatNavigation();
  const insets = useSafeAreaInsets();
  const panelView = useChatStore((state) => state.panelView);
  const context = useChatStore((state) => state.context);
  const startNew = useChatStore((state) => state.startNew);
  const closePanel = useChatStore((state) => state.closePanel);
  const showHistory = useChatStore((state) => state.showHistory);
  const showConversation = useChatStore((state) => state.showConversation);
  const title = useChatStore((state) => state.title);
  const currentId = useChatStore((state) => state.currentId);
  const caption = useConversationCaption();

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
            {context?.subtitle ?? caption}
          </Text>
        </View>
        <IconButton
          icon="maximize"
          accessibilityLabel="Abrir em tela cheia"
          onPress={chat.openFullScreen}
        />
        <IconButton icon="close" accessibilityLabel="Fechar conversa" onPress={closePanel} />
      </ChatColumnHeader>
      <ChatPanelBody bottomInset={insets.bottom} />
    </ChatSideColumn>
  );
}
