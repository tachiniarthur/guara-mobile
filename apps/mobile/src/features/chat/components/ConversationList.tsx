import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

import type { ConversationSummary } from '../data';

export interface ConversationListProps {
  groups: { label: string; items: ConversationSummary[] }[];
  currentId?: string;
  /** Opens a conversation in place (side panel) instead of navigating to its page. */
  onSelect?: (conversationId: string) => void;
}

/** Past conversations grouped by period ("Hoje", "Esta semana", "Agosto"). */
export function ConversationList({ groups, currentId, onSelect }: ConversationListProps) {
  const router = useRouter();
  return (
    <View>
      {groups.map((group) => (
        <View key={group.label}>
          <Text
            size={12}
            weight="bold"
            tone="subtle"
            tracking={0.1}
            accessibilityRole="header"
            className="mb-0.5 ml-2.5 mt-2.5"
          >
            {group.label.toUpperCase()}
          </Text>
          <View className="gap-0.5">
            {group.items.map((item) => {
              const current = item.id === currentId;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="link"
                  accessibilityState={{ selected: current }}
                  onPress={() =>
                    onSelect
                      ? onSelect(item.id)
                      : router.navigate({
                          pathname: '/chat/[conversationId]',
                          params: { conversationId: item.id },
                        })
                  }
                  className={cn(
                    'min-h-13 gap-0.5 rounded-full px-2.5 py-2 active:bg-surface-pressed',
                    current && 'bg-surface-muted',
                  )}
                >
                  <View className="flex-row items-baseline gap-2">
                    <Text
                      size={14}
                      weight={current ? 'bold' : 'medium'}
                      numberOfLines={1}
                      className="min-w-0 flex-1"
                    >
                      {item.title}
                    </Text>
                    <Text size={12} tone="subtle">
                      {item.time}
                    </Text>
                  </View>
                  <Text size={12} tone="subtle" numberOfLines={1}>
                    {item.preview}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
