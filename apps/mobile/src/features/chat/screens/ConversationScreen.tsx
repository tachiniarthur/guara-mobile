import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/layout';

export function ConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  return <PlaceholderScreen title="Conversa" subtitle={conversationId} />;
}
