import { Pressable, View } from 'react-native';

import { Badge, MoneyText, Text } from '@/components/ui';

import type { SubscriptionItem } from '../data';

export interface SubscriptionListItemProps {
  item: SubscriptionItem;
  onNotSubscription: (item: SubscriptionItem) => void;
  /** Tablet: the "Não é assinatura?" link sits under the amount. */
  wide?: boolean;
}

/** Detected subscription: logo tile, account, next charge, flags and amount per month. */
export function SubscriptionListItem({
  item,
  onNotSubscription,
  wide = false,
}: SubscriptionListItemProps) {
  const notSubscription = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.name} não é assinatura`}
      onPress={() => onNotSubscription(item)}
      className={wide ? 'h-9 justify-center px-2.5' : 'h-8 justify-center self-start'}
    >
      <Text size={13} tone="muted" underline>
        Não é assinatura?
      </Text>
    </Pressable>
  );

  return (
    <View className="flex-row items-start gap-3.5 border-b border-border py-3.5">
      <View className="h-10 w-10 items-center justify-center rounded-10 border border-border bg-background">
        <Text serif weight="bold" size={17} leading={1}>
          {item.mark}
        </Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text weight="bold" leading={1.35}>
          {item.name}
        </Text>
        <Text size={13} tone="subtle" leading={1.35}>
          {item.detail}
        </Text>
        <Text size={13} tone="muted" leading={1.35}>
          Próxima cobrança em {String(item.day).padStart(2, '0')} out
        </Text>
        {item.flag ? (
          <View className="mt-1.5 flex-row">
            <Badge label={item.flag.label} tone={item.flag.tone} />
          </View>
        ) : null}
        {wide ? null : notSubscription}
      </View>
      <View className="items-end gap-0.5">
        <MoneyText value={item.amount} size={16} weight="bold" />
        <Text size={12} tone="subtle">
          por mês
        </Text>
        {wide ? notSubscription : null}
      </View>
    </View>
  );
}
