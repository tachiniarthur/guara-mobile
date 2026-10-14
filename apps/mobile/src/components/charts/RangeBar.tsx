import { colors } from '@guara/ui-tokens';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { SkeletonBlock } from '@/components/ui/SkeletonScope';
import { Text } from '@/components/ui/Text';

export interface RangeBarProps {
  /** Where the current value sits, 0–100. */
  position: number;
  minLabel: string;
  maxLabel: string;
  accessibilityLabel: string;
}

/** Low–high band (Urucum → Tucano → Folha) with a marker on the current price. */
function RangeBarDrawing({ position, minLabel, maxLabel, accessibilityLabel }: RangeBarProps) {
  const left = Math.min(100, Math.max(0, position));

  return (
    <View className="gap-2">
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
        className="h-2.5"
      >
        <Svg width="100%" height={10}>
          <Defs>
            <LinearGradient id="range" x1="0" x2="1" y1="0" y2="0">
              <Stop offset="0" stopColor={colors.negative.DEFAULT} stopOpacity={0.55} />
              <Stop offset="0.5" stopColor={colors.warning.DEFAULT} stopOpacity={0.55} />
              <Stop offset="1" stopColor={colors.positive.DEFAULT} stopOpacity={0.55} />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width="100%" height={10} rx={5} fill="url(#range)" />
        </Svg>
        <View
          className="absolute h-[26px] w-[26px] rounded-full border-[3px] border-surface bg-foreground"
          style={{ left: `${left}%`, top: -8, marginLeft: -13 }}
        />
      </View>
      <View className="flex-row justify-between">
        <Text size={13} tone="muted" tabular>
          {minLabel}
        </Text>
        <Text size={13} tone="muted" tabular>
          {maxLabel}
        </Text>
      </View>
    </View>
  );
}

/** RangeBar as a flat area while loading (`SkeletonBlock`). */
export function RangeBar(props: RangeBarProps) {
  return (
    <SkeletonBlock>
      <RangeBarDrawing {...props} />
    </SkeletonBlock>
  );
}
