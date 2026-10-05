import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Screen, TopBar } from '@/components/layout';
import { SearchInput, Text } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useChatDocked } from '@/hooks/useChatDocked';
import { AccountMenuButton } from '@/navigation/AccountMenu';
import { conversationHref } from '@/navigation/destinations';

import { ConversationList, NewConversationButton } from '../components';
import { CONVERSATION, CONVERSATION_GROUPS, CONVERSATIONS_COUNT } from '../data';

import { ConversationScreen } from './ConversationScreen';

/** Histórico de conversas (search, new conversation, grouped list). */
export function ChatHistoryScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const docked = useChatDocked();
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLocaleLowerCase('pt-BR');
  const groups = CONVERSATION_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      `${item.title} ${item.preview}`.toLocaleLowerCase('pt-BR').includes(normalized),
    ),
  })).filter((group) => group.items.length > 0);

  const startNew = () => router.navigate(conversationHref());

  // Wide tablets: history and conversation side by side (the history column has the panel width).
  if (docked) return <ConversationScreen />;

  return (
    <Screen
      header={
        isTablet ? (
          <View className="h-[72px] flex-row items-center gap-2 border-b border-border pl-7 pr-5">
            <View className="flex-1">
              <Text
                serif
                weight="bold"
                size={22}
                tracking={-0.01}
                leading={1.3}
                accessibilityRole="header"
              >
                Histórico de conversas
              </Text>
              <Text variant="caption" tone="subtle" leading={1.3}>
                {CONVERSATIONS_COUNT} conversas com a equipe
              </Text>
            </View>
            <NewConversationButton variant="pill" onPress={startNew} />
          </View>
        ) : (
          <TopBar title="Conversas" leading="none" actions={<AccountMenuButton />} />
        )
      }
      contentClassName={isTablet ? 'gap-4 px-7 py-6' : undefined}
    >
      {isTablet ? null : <NewConversationButton onPress={startNew} />}
      <SearchInput
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar conversas"
        accessibilityLabel="Buscar conversas"
      />
      <ConversationList groups={groups} currentId={CONVERSATION.id} />
    </Screen>
  );
}
