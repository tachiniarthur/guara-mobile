import { colors } from '@guara/ui-tokens';
import { useState } from 'react';
import { Circle, Line, Path } from 'react-native-svg';

import { AxisLabel, ChartFrame } from './ChartFrame';

export interface BalanceMarker {
  day: number;
  label: string;
  /** `in` (Arara-azul) or `out` (Urucum). */
  tone: 'in' | 'out';
  /** Top of the label (design: 26 or 46). */
  labelY: number;
}

export interface BalanceLineChartProps {
  /** Balance at the end of each day so far (index 0 = day 1). */
  values: readonly number[];
  /** Projected balance for the remaining days. */
  projection: readonly number[];
  daysInPeriod: number;
  minValue: number;
  maxValue: number;
  ticks: readonly { value: number; label: string }[];
  markers?: readonly BalanceMarker[];
  dayTicks?: readonly number[];
  describeDay?: (day: number) => string;
  accessibilityLabel: string;
}

const WIDTH = 340;
const LEFT = 52;
const RIGHT = 324;
const TOP = 58.4;
const BOTTOM = 206;

/** Balance day by day with filled area, dashed projection and markers on the big moves. */
export function BalanceLineChart({
  values,
  projection,
  daysInPeriod,
  minValue,
  maxValue,
  ticks,
  markers = [],
  dayTicks = [1, 5, 10, 15, 20],
  describeDay,
  accessibilityLabel,
}: BalanceLineChartProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const x = (day: number) => LEFT + ((day - 1) / (daysInPeriod - 1)) * (RIGHT - LEFT);
  const y = (value: number) =>
    BOTTOM - ((value - minValue) / (maxValue - minValue)) * (BOTTOM - TOP);
  const today = values.length;
  const line = values
    .map((value, index) => `${index === 0 ? 'M' : 'L'}${x(index + 1)},${y(value)}`)
    .join(' ');
  const last = values[today - 1] ?? minValue;
  const projectionPath = [
    `M${x(today)},${y(last)}`,
    ...projection.map((value, index) => `L${x(today + index + 1)},${y(value)}`),
  ].join(' ');
  const markerColor = (tone: BalanceMarker['tone']) =>
    tone === 'in' ? colors.info.DEFAULT : colors.negative.DEFAULT;

  return (
    <ChartFrame
      width={WIDTH}
      height={240}
      accessibilityLabel={accessibilityLabel}
      tooltip={selected && describeDay ? describeDay(selected) : null}
    >
      {ticks.map((tick) => (
        <Line
          key={tick.value}
          x1={LEFT}
          x2={RIGHT}
          y1={y(tick.value)}
          y2={y(tick.value)}
          stroke={colors.chart.grid}
          strokeDasharray="2 4"
        />
      ))}
      {ticks.map((tick) => (
        <AxisLabel
          key={`l-${tick.value}`}
          x={LEFT - 8}
          y={y(tick.value) + 4}
          label={tick.label}
          anchor="end"
          size={11}
        />
      ))}
      <Path d={`${line} L${x(today)},${BOTTOM} L${x(1)},${BOTTOM} Z`} fill={colors.info.muted} />
      <Path
        d={line}
        fill="none"
        stroke={colors.info.DEFAULT}
        strokeWidth={2.6}
        strokeLinejoin="round"
      />
      <Path
        d={projectionPath}
        fill="none"
        stroke={colors.info.DEFAULT}
        strokeWidth={2}
        strokeDasharray="5 5"
      />
      <Line x1={LEFT} x2={RIGHT} y1={BOTTOM} y2={BOTTOM} stroke={colors.chart.axis} />
      {values.map((value, index) => (
        <Circle
          key={`hit-${index}`}
          cx={x(index + 1)}
          cy={y(value)}
          r={8}
          fill="transparent"
          onPress={() => setSelected((day) => (day === index + 1 ? null : index + 1))}
        />
      ))}
      {markers.map((marker) => {
        const cy = y(values[marker.day - 1] ?? last);
        const color = markerColor(marker.tone);
        return [
          <Line
            key={`ml-${marker.day}`}
            x1={x(marker.day)}
            x2={x(marker.day)}
            y1={marker.labelY + 6}
            y2={cy - 7}
            stroke={color}
            strokeWidth={1}
            opacity={0.7}
          />,
          <Circle
            key={`mc-${marker.day}`}
            cx={x(marker.day)}
            cy={cy}
            r={5.5}
            fill={colors.surface.DEFAULT}
            stroke={color}
            strokeWidth={2.4}
          />,
          <AxisLabel
            key={`mt-${marker.day}`}
            x={x(marker.day)}
            y={marker.labelY}
            label={marker.label}
            strong
            size={11}
            color={marker.tone === 'out' ? colors.negative.DEFAULT : colors.foreground.DEFAULT}
          />,
        ];
      })}
      {[...dayTicks, today, daysInPeriod].map((day) => (
        <AxisLabel
          key={`d-${day}`}
          x={x(day)}
          y={230}
          label={day === today ? 'hoje' : String(day)}
          strong={day === today}
          size={11}
        />
      ))}
    </ChartFrame>
  );
}
