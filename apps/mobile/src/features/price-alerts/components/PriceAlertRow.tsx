import { Pressable, View } from 'react-native';

import { Badge, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

import type { PriceAlertView } from '../hooks/usePriceAlerts';
import { SIDE_LABEL, closeness, conditionText, remainingText } from '../lib/price-alerts';

/** Price alert: asset, buy/sell badge, condition, distance bar and what is left. */
export function PriceAlertRow({
  alert,
  onPress,
  last = false,
}: {
  alert: PriceAlertView;
  onPress: () => void;
  last?: boolean;
}) {
  const sell = alert.side === 'sell';
  const paused = alert.status !== 'active';
  const remaining = remainingText(alert.side, alert.quote.price, alert.targetPrice);
  const condition = conditionText(alert, alert.quote);
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${alert.quote.name}, ${SIDE_LABEL[alert.side].toLowerCase()}. ${condition}. ${paused ? 'Pausado' : remaining}`}
      onPress={onPress}
      className={cn('gap-2 py-3.5 active:bg-surface-pressed', !last && 'border-b border-border')}
    >
      <View className="flex-row items-center gap-2">
        <Text weight="bold" className="flex-1">
          {alert.quote.name}
        </Text>
        {paused ? <Badge label={alert.status === 'triggered' ? 'Disparado' : 'Pausado'} /> : null}
        <Badge
          label={SIDE_LABEL[alert.side]}
          tone={sell ? 'negative' : 'positive'}
          icon={sell ? 'arrowUp' : 'arrowDown'}
        />
      </View>
      <Text size={14} tone="muted" tabular>
        {condition}
      </Text>
      <View className="h-1.5 rounded-[3px] bg-border" style={{ borderRadius: 3 }}>
        <View
          className={cn('h-1.5', sell ? 'bg-negative' : 'bg-positive')}
          style={{
            width: `${closeness(alert.quote.price, alert.targetPrice)}%`,
            borderRadius: 3,
          }}
        />
      </View>
      <Text size={12} tone="subtle">
        {remaining.charAt(0).toUpperCase() + remaining.slice(1)}
      </Text>
    </Pressable>
  );
}
