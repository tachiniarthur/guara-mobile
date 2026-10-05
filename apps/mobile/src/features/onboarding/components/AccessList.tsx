import { colors } from '@guara/ui-tokens';
import { View } from 'react-native';

import { Icon, Text } from '@/components/ui';

import { ACCESS_ITEMS } from '../data';

/** "O que o Guará acessa": what we see (✓) and what we never do (✕). */
export function AccessList() {
  return (
    <View className="gap-2.5 rounded-20 bg-surface-muted p-4">
      <Text size={14} weight="bold">
        O que o Guará acessa
      </Text>
      <View className="gap-1.5">
        {ACCESS_ITEMS.map((item) => (
          <View key={item.label} className="flex-row items-center gap-2">
            <Icon
              name={item.allowed ? 'check' : 'close'}
              size={16}
              strokeWidth={2.2}
              color={item.allowed ? colors.positive.DEFAULT : colors.negative.DEFAULT}
            />
            <Text size={14} tone="muted">
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
