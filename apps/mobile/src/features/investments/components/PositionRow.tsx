import { formatCentsForSpeech } from '@guara/utils';
import { Pressable, View } from 'react-native';

import { MoneyText, Text } from '@/components/ui';

import type { Position } from '../data';
import { changeText, shareText } from '../lib/positions';

import { RiskPill } from './RiskPill';

export interface PositionRowProps {
  position: Position;
  onPress: () => void;
  onAdjustRisk: () => void;
}

/** Day change with ▲/▼ (never color alone). */
export function PositionChange({ change }: { change: number }) {
  const up = change >= 0;
  const tone = up ? 'positive' : 'negative';
  return (
    <Text size={13} weight="bold" tone={tone} tabular leading={1.35} numberOfLines={1}>
      <Text size={10} tone={tone}>
        {up ? '▲' : '▼'}
      </Text>{' '}
      {changeText(change)}
    </Text>
  );
}

/** Row of Posições (phone): name, description, risk and origin; value, share and day change. */
export function PositionRow({ position, onPress, onAdjustRisk }: PositionRowProps) {
  return (
    <View className="flex-row items-center gap-3 border-b border-border py-3">
      <View className="min-w-0 flex-1">
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`${position.name}, ${position.listDetail}. ${formatCentsForSpeech(position.value)}, ${shareText(position.share)} da carteira, hoje ${changeText(position.change)}`}
          onPress={onPress}
          className="active:opacity-80"
        >
          <Text size={15} weight="bold" leading={1.35}>
            {position.name}
          </Text>
          <Text size={12} tone="subtle" leading={1.35} numberOfLines={1}>
            {position.listDetail}
          </Text>
        </Pressable>
        <View className="mt-1 flex-row items-center gap-1.5">
          <RiskPill
            risk={position.risk}
            size="sm"
            assetName={position.name}
            onPress={onAdjustRisk}
          />
          <Text size={12} tone="subtle" numberOfLines={1} className="min-w-0 flex-shrink">
            {position.origin.label}
          </Text>
        </View>
      </View>
      <Pressable
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        onPress={onPress}
        className="items-end active:opacity-80"
      >
        <MoneyText value={position.value} size={15} weight="bold" leading={1.35} />
        <Text size={12} tone="muted" leading={1.35} tabular>
          {`${shareText(position.share)} da carteira`}
        </Text>
        <PositionChange change={position.change} />
      </Pressable>
    </View>
  );
}
