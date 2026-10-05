import { View } from 'react-native';

import { Badge, Text } from '@/components/ui';
import { AssistantAvatar } from '@/features/chat';

import type { NoticeHistoryItem } from '../data';

/** A notice already sent: who sent it, what, when and through which channel. */
export function NoticeHistoryRow({ item }: { item: NoticeHistoryItem }) {
  return (
    <View className="flex-row items-start gap-3 border-b border-border py-3">
      <AssistantAvatar assistant={item.assistant} size={32} />
      <View className="min-w-0 flex-1">
        <Text weight="medium" leading={1.4}>
          {item.title}
        </Text>
        <Text size={12} tone="subtle" leading={1.4}>
          {item.detail}
        </Text>
        {item.pending ? (
          <View className="mt-1 flex-row">
            <Badge label="Aguardando sua resposta" tone="negative" />
          </View>
        ) : null}
      </View>
    </View>
  );
}
