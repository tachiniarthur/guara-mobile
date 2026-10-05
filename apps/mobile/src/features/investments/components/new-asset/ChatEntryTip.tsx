import { View } from 'react-native';

import { Span, Text } from '@/components/ui';
import { AssistantAvatar } from '@/features/chat';

import { NEW_ASSET_NOTES } from '../../new-asset';

/** Pacu reminding that investments can also be registered by chat. */
export function ChatEntryTip() {
  return (
    <View className="flex-row gap-3 rounded-20 bg-surface-muted p-4">
      <AssistantAvatar assistant="pacu" size={32} />
      <Text size={14} leading={1.55} className="flex-1">
        Também dá para cadastrar pelo chat. Por exemplo:{' '}
        <Span italic>{NEW_ASSET_NOTES.chatExample}</Span>.
      </Text>
    </View>
  );
}
