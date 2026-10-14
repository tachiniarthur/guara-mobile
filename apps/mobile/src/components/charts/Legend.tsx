import { colors } from '@guara/ui-tokens';
import { View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { useSkeleton } from '@/components/ui/SkeletonScope';
import { Text } from '@/components/ui/Text';

export interface LegendSwatchProps {
  label: string;
  color?: string;
  /** Dashed line (forecasts, averages). */
  dashed?: boolean;
  /** Square dot instead of a line (bars, allocations). */
  shape?: 'line' | 'dot';
  /** Line width (design: 14, 16 or 18). */
  width?: number;
  /** Label size (design: 12, or 13 under the asset charts). */
  size?: 12 | 13;
}

/** Legend item of a chart: colored line (or dashed) + label. */
export function LegendSwatch({
  label,
  color = colors.foreground.subtle,
  dashed = false,
  shape = 'line',
  width = 14,
  size = 12,
}: LegendSwatchProps) {
  // Loading: the swatch keeps its room in the loading color.
  const swatch = useSkeleton() ? colors.skeleton.surface : color;
  return (
    <View className={size === 13 ? 'flex-row items-center gap-2' : 'flex-row items-center gap-1.5'}>
      {shape === 'dot' ? (
        <View className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: swatch }} />
      ) : dashed ? (
        <DashedLine width={width} color={swatch} />
      ) : (
        <View className="h-[3px] rounded-2" style={{ width, backgroundColor: swatch }} />
      )}
      <Text size={size} tone="muted">
        {label}
      </Text>
    </View>
  );
}

/** Horizontal dashed line (React Native has no reliable one-sided dashed border). */
export function DashedLine({
  width,
  color,
  strokeWidth = 2,
  dash = '4 3',
}: {
  width: number | `${number}%`;
  color: string;
  strokeWidth?: number;
  dash?: string;
}) {
  return (
    <Svg width={width} height={strokeWidth}>
      <Line
        x1={0}
        x2="100%"
        y1={strokeWidth / 2}
        y2={strokeWidth / 2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
    </Svg>
  );
}
