import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { SkeletonBlock } from '@/components/ui/SkeletonScope';

export interface DonutSegment {
  key: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  segments: readonly DonutSegment[];
  /** Diameter in dp (design: 180 phone, 160 tablet). */
  size?: number;
  strokeWidth?: number;
  /** Gap between segments along the ring. */
  gap?: number;
  /** Content in the hole ("Saídas R$ 5.912"). */
  children?: ReactNode;
  /** Ring drawn under the segments (design: Sombra on the allocation donuts). */
  trackColor?: string;
}

/** Ring chart starting at 12 o'clock, with small gaps between segments. */
function DonutChartDrawing({
  segments,
  size = 180,
  strokeWidth = 22,
  gap = 3,
  children,
  trackColor,
}: DonutChartProps) {
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const lengths = segments.map((segment) => (segment.value / total) * circumference);
  // Where each segment starts along the circle (sum of the previous ones).
  const starts = lengths.map((_, index) =>
    lengths.slice(0, index).reduce((sum, length) => sum + length, 0),
  );

  return (
    <View
      style={{ width: size, height: size }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {trackColor ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
        ) : null}
        {segments.map((segment, index) => {
          const dash = Math.max(0, (lengths[index] ?? 0) - gap);
          return (
            <Circle
              key={segment.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={-(starts[index] ?? 0)}
            />
          );
        })}
      </Svg>
      <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center">
        {children}
      </View>
    </View>
  );
}

/** DonutChart as a flat area while loading (`SkeletonBlock`). */
export function DonutChart(props: DonutChartProps) {
  return (
    <SkeletonBlock>
      <DonutChartDrawing {...props} />
    </SkeletonBlock>
  );
}
