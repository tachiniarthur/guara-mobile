import type { Cents } from '@guara/types';
import { Pressable, View } from 'react-native';

import { MoneyText, Text } from '@/components/ui';

export interface SubscriptionRowProps {
  name: string;
  next: string;
  amount: Cents;
  /** Opens the subscription. */
  onPress?: () => void;
}

/** Compact subscription line with the logo tile ("Spotify · próxima em 02/out · R$ 21,90"). */
export function SubscriptionRow({ name, next, amount, onPress }: SubscriptionRowProps) {
  return (
    <Pressable
      accessibilityRole="link"
      disabled={!onPress}
      onPress={onPress}
      className="min-h-11 flex-row items-center gap-3 active:bg-surface-pressed"
    >
      <View className="h-[34px] w-[34px] items-center justify-center rounded-8 border border-border bg-background">
        <Text serif weight="bold" leading={1}>
          {name[0]}
        </Text>
      </View>
      <View className="flex-1">
        <Text weight="medium" leading={1.3}>
          {name}
        </Text>
        <Text size={12} tone="subtle" leading={1.3}>
          {next}
        </Text>
      </View>
      <MoneyText value={amount} weight="bold" />
    </Pressable>
  );
}
