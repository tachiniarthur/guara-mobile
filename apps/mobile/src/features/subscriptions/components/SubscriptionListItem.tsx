import type { IsoDate } from '@guara/types';
import { formatDate } from '@guara/utils';
import { Pressable, View } from 'react-native';

import { Badge, MoneyText, Text } from '@/components/ui';

import type { SubscriptionItem } from '../data';
import { flagsOf, nextCharge } from '../lib/subscriptions';

export interface SubscriptionListItemProps {
  item: SubscriptionItem;
  today: IsoDate;
  onOpen: (item: SubscriptionItem) => void;
  onNotSubscription: (item: SubscriptionItem) => void;
  /** Tablet: the "Não é assinatura?" link sits under the amount. */
  wide?: boolean;
}

/** "Netflix" mark tile (list, calendar list and detail). */
export function SubscriptionMark({ mark, size = 40 }: { mark: string; size?: 36 | 40 | 52 }) {
  return (
    <View
      className="items-center justify-center border border-border bg-background"
      style={{ width: size, height: size, borderRadius: size >= 52 ? 14 : 10 }}
    >
      <Text serif weight="bold" size={size >= 52 ? 22 : size >= 40 ? 17 : 15} leading={1}>
        {mark}
      </Text>
    </View>
  );
}

/** Detected subscription: logo tile, account, next charge, flags and amount per month. */
export function SubscriptionListItem({
  item,
  today,
  onOpen,
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
  const flags = flagsOf(item);

  return (
    <View className="flex-row items-start gap-3.5 border-b border-border py-3.5">
      <SubscriptionMark mark={item.mark} />
      <View className="min-w-0 flex-1">
        <Pressable
          accessibilityRole="link"
          accessibilityHint="Abre a assinatura"
          onPress={() => onOpen(item)}
          className="self-start"
        >
          <Text weight="bold" leading={1.35}>
            {item.name}
          </Text>
        </Pressable>
        <Text size={13} tone="subtle" leading={1.35}>
          {`${item.kind} · ${item.bank} ${item.payment}`}
        </Text>
        <Text size={13} tone="muted" leading={1.35}>
          {`Próxima cobrança em ${formatDate(nextCharge(item, today), 'dd MMM').replace('.', '')}`}
        </Text>
        {flags.length ? (
          <View className="mt-1.5 flex-row flex-wrap gap-1.5">
            {flags.map((flag) => (
              <Badge key={flag.label} label={flag.label} tone={flag.tone} />
            ))}
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
