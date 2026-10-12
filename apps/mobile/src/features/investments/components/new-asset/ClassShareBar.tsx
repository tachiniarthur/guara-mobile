import { View } from 'react-native';

import { Text } from '@/components/ui';

import { shareText } from '../../lib/allocation';

export interface ClassShareBarProps {
  label: string;
  /** Share of the portfolio, 0–100. */
  share: number;
  /** Profile target, 0–100. */
  target: number;
  color: string;
}

/** The bars use a 0–50% scale, so a 20% target sits at 40% of the width. */
const SCALE = 2;

/** Share of a group with the profile target marked on the bar. */
export function ClassShareBar({ label, share, target, color }: ClassShareBarProps) {
  return (
    <View className="gap-1">
      <View className="flex-row justify-between">
        <Text size={13} tone="muted">
          {label}
        </Text>
        <Text size={13} weight="bold" tabular>
          {shareText(share)}
        </Text>
      </View>
      <View className="h-2.5 rounded-full bg-surface-muted">
        <View
          className="absolute bottom-0 left-0 top-0 rounded-full"
          style={{ width: `${Math.min(100, share * SCALE)}%`, backgroundColor: color }}
        />
        <View
          className="absolute w-0.5 bg-foreground"
          style={{ left: `${Math.min(100, target * SCALE)}%`, top: -3, bottom: -3 }}
        />
      </View>
    </View>
  );
}
