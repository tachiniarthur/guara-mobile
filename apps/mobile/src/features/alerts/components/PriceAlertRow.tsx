import { View } from 'react-native';

import { Badge, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

import type { PriceAlertSummary } from '../data';

/** Price alert: asset, buy/sell badge, condition, distance bar and what is left. */
export function PriceAlertRow({ alert }: { alert: PriceAlertSummary }) {
  const sell = alert.side === 'sell';
  return (
    <View className="gap-2 border-b border-border py-3.5">
      <View className="flex-row items-center gap-2">
        <Text weight="bold" className="flex-1">
          {alert.asset}
        </Text>
        <Badge
          label={sell ? 'VENDA' : 'COMPRA'}
          tone={sell ? 'negative' : 'positive'}
          icon={sell ? 'arrowUp' : 'arrowDown'}
        />
      </View>
      <Text size={14} tone="muted" tabular>
        {alert.condition}
      </Text>
      <View accessibilityElementsHidden className="h-1.5 rounded-[3px] bg-border">
        <View
          className={cn('h-1.5 rounded-[3px]', sell ? 'bg-negative' : 'bg-positive')}
          style={{ width: `${alert.progress}%` }}
        />
      </View>
      <Text size={12} tone="subtle">
        {alert.remaining}
      </Text>
    </View>
  );
}
