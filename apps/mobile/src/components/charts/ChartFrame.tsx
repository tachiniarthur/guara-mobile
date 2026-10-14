import { colors, fontFamily } from '@guara/ui-tokens';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Line, Text as SvgText } from 'react-native-svg';

import { SkeletonBlock } from '@/components/ui/SkeletonScope';
import { Text } from '@/components/ui/Text';

export const CHART_FONT = {
  regular: fontFamily.regular,
  bold: fontFamily.extrabold,
};

export interface ChartFrameProps {
  width: number;
  height: number;
  accessibilityLabel: string;
  /** Text of the tapped point, shown in a pill above the chart. */
  tooltip?: string | null;
  children: ReactNode;
}

/** Responsive SVG box (viewBox scaled to the container width) with an optional tooltip. */
export function ChartFrame({
  width,
  height,
  accessibilityLabel,
  tooltip,
  children,
}: ChartFrameProps) {
  return (
    <SkeletonBlock>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
        style={{ width: '100%', aspectRatio: width / height }}
      >
        <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
          {children}
        </Svg>
        {tooltip ? (
          <View
            pointerEvents="none"
            className="absolute left-0 right-0 top-0 items-center"
            accessibilityLiveRegion="polite"
          >
            <View className="rounded-full border border-border-strong bg-surface-input px-3 py-1">
              <Text size={12} weight="bold">
                {tooltip}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </SkeletonBlock>
  );
}

export interface GridLinesProps {
  ticks: readonly { value: number; label: string }[];
  y: (value: number) => number;
  left: number;
  right: number;
  labelX: number;
}

/** Dashed horizontal grid with labels on the left. */
export function GridLines({ ticks, y, left, right, labelX }: GridLinesProps) {
  return (
    <>
      {ticks.map((tick) => (
        <Line
          key={`g-${tick.value}`}
          x1={left}
          x2={right}
          y1={y(tick.value)}
          y2={y(tick.value)}
          stroke={colors.chart.grid}
          strokeDasharray="3 5"
        />
      ))}
      {ticks.map((tick) => (
        <SvgText
          key={`l-${tick.value}`}
          x={labelX}
          y={y(tick.value) + 4}
          textAnchor="end"
          fontSize={12}
          fill={colors.foreground.subtle}
          fontFamily={CHART_FONT.regular}
        >
          {tick.label}
        </SvgText>
      ))}
    </>
  );
}

export function AxisLabel({
  x,
  y,
  label,
  strong = false,
  anchor = 'middle',
  color,
  size = 12,
}: {
  x: number;
  y: number;
  label: string;
  strong?: boolean;
  anchor?: 'start' | 'middle' | 'end';
  color?: string;
  size?: number;
}) {
  return (
    <SvgText
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fill={color ?? (strong ? colors.foreground.DEFAULT : colors.foreground.subtle)}
      fontFamily={strong ? CHART_FONT.bold : CHART_FONT.regular}
    >
      {label}
    </SvgText>
  );
}
