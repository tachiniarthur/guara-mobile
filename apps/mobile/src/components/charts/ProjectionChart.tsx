import { colors } from '@guara/ui-tokens';
import { useId, useState } from 'react';
import { Circle, Defs, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { AxisLabel, ChartFrame } from './ChartFrame';

export interface ProjectionChartProps {
  /** Total with returns at each point. */
  values: readonly number[];
  /** Only what was put in (gray area, dashed line). */
  contributed: readonly number[];
  /** Dashed Tucano goal line with its label ("Meta R$ 3,0 mi"). */
  goal?: { value: number; label: string };
  /** Labels spread along the x axis. */
  xLabels: readonly string[];
  color?: string;
  describePoint?: (index: number) => string;
  /** Tablet canvas (720×260). */
  wide?: boolean;
  accessibilityLabel: string;
}

const LEFT = 8;
const COMPACT = {
  width: 340,
  height: 220,
  right: 332,
  top: 42.1,
  bottom: 194,
  labelY: 212,
  font: 11,
  goalFont: 12,
};
const WIDE = {
  width: 720,
  height: 260,
  right: 712,
  top: 45.1,
  bottom: 234,
  labelY: 252,
  font: 12,
  goalFont: 13,
};

/** Growth of savings over time: returns (colored area) over what was contributed (gray). */
export function ProjectionChart({
  values,
  contributed,
  goal,
  xLabels,
  color = colors.info.DEFAULT,
  describePoint,
  wide = false,
  accessibilityLabel,
}: ProjectionChartProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const gradientId = `projection-${useId().replace(/:/g, '')}`;
  const { width, height, right, top, bottom, labelY, font, goalFont } = wide ? WIDE : COMPACT;
  const max = Math.max(goal?.value ?? 0, ...values, 1);
  const x = (index: number) => LEFT + (index / Math.max(1, values.length - 1)) * (right - LEFT);
  const y = (value: number) => bottom - (value / max) * (bottom - top);
  const line = (series: readonly number[]) =>
    series
      .map(
        (value, index) => `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)},${y(value).toFixed(1)}`,
      )
      .join(' ');
  const area = (series: readonly number[]) =>
    `${line(series)} L${right},${bottom} L${LEFT},${bottom} Z`;
  const last = values.length - 1;
  const slot = (right - LEFT) / Math.max(1, values.length - 1);

  return (
    <ChartFrame
      width={width}
      height={height}
      accessibilityLabel={accessibilityLabel}
      tooltip={selected !== null && describePoint ? describePoint(selected) : null}
    >
      <Defs>
        <LinearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.35} />
          <Stop offset="1" stopColor={color} stopOpacity={0.03} />
        </LinearGradient>
      </Defs>
      <Path d={area(contributed)} fill={colors.chart.grid} opacity={0.9} />
      <Path d={area(values)} fill={`url(#${gradientId})`} />
      <Path
        d={line(contributed)}
        fill="none"
        stroke={colors.foreground.subtle}
        strokeWidth={1.6}
        strokeDasharray="5 4"
      />
      <Path d={line(values)} fill="none" stroke={color} strokeWidth={2.6} strokeLinejoin="round" />
      {goal ? (
        <>
          <Line
            x1={LEFT}
            x2={right}
            y1={y(goal.value)}
            y2={y(goal.value)}
            stroke={colors.brand.DEFAULT}
            strokeWidth={1.6}
            strokeDasharray="3 4"
          />
          <AxisLabel
            x={12}
            y={y(goal.value) - 8}
            label={goal.label}
            anchor="start"
            strong
            color={colors.brand.DEFAULT}
            size={goalFont}
          />
        </>
      ) : null}
      {selected !== null ? (
        <Line x1={x(selected)} x2={x(selected)} y1={top} y2={bottom} stroke={colors.chart.axis} />
      ) : null}
      {values.map((_, index) => (
        <Rect
          key={index}
          x={x(index) - slot / 2}
          y={top}
          width={slot}
          height={bottom - top}
          fill="transparent"
          onPress={() => setSelected((current) => (current === index ? null : index))}
        />
      ))}
      <Circle
        cx={x(last)}
        cy={y(values[last] ?? 0)}
        r={5}
        fill={colors.surface.DEFAULT}
        stroke={color}
        strokeWidth={2.4}
      />
      <Line x1={LEFT} x2={right} y1={bottom} y2={bottom} stroke={colors.chart.axis} />
      {xLabels.map((label, index) => (
        <AxisLabel
          key={`${label}-${index}`}
          x={LEFT + (index / Math.max(1, xLabels.length - 1)) * (right - LEFT)}
          y={labelY}
          label={label}
          size={font}
          anchor={index === 0 ? 'start' : index === xLabels.length - 1 ? 'end' : 'middle'}
        />
      ))}
    </ChartFrame>
  );
}
