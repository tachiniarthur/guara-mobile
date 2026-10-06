import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, SearchInput, Text } from '@/components/ui';

import { useConversationHistory } from '../hooks/useConversationHistory';

import { ChatColumnHeader } from './ChatSideColumn';
import { ConversationList } from './ConversationList';
import { NewConversationButton } from './NewConversationButton';

export interface ChatHistoryPanelProps {
  currentId?: string;
  onSelect?: (conversationId: string) => void;
  onNew: () => void;
  /** Close button (only in the side panel). */
  onClose?: () => void;
}

/** Conversations inside a chat column: new conversation, search and the grouped list. */
export function ChatHistoryPanel({ currentId, onSelect, onNew, onClose }: ChatHistoryPanelProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const { groups, count } = useConversationHistory(query);

  return (
    <>
      <ChatColumnHeader>
        <View className="min-w-0 flex-1">
          <Text serif weight="bold" size={18} leading={1.3} accessibilityRole="header">
            Conversas
          </Text>
          <Text size={12} tone="subtle" leading={1.3}>
            {count} {count === 1 ? 'conversa' : 'conversas'} com a equipe
          </Text>
        </View>
        {onClose ? (
          <IconButton icon="close" accessibilityLabel="Fechar conversas" onPress={onClose} />
        ) : null}
      </ChatColumnHeader>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <NewConversationButton onPress={onNew} />
        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar conversas"
          accessibilityLabel="Buscar conversas"
        />
        <ConversationList groups={groups} currentId={currentId} onSelect={onSelect} />
      </ScrollView>
    </>
  );
}
