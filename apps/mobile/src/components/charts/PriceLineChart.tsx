import { colors } from '@guara/ui-tokens';
import { useState } from 'react';
import { Circle, Defs, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { AxisLabel, ChartFrame } from './ChartFrame';

export interface PriceTarget {
  value: number;
  /** "Alerta de venda: R$ 650 mil". */
  label: string;
  axisLabel: string;
  tone: 'negative' | 'positive';
}

export interface PriceLineChartProps {
  values: readonly number[];
  minValue: number;
  maxValue: number;
  ticks: readonly { value: number; label: string }[];
  /** X labels with their point index. */
  xLabels: readonly { index: number; label: string }[];
  target?: PriceTarget;
  /** Label under the lowest point ("mín. 553,6 mil"). */
  minLabel?: string;
  describePoint?: (index: number) => string;
  accessibilityLabel: string;
}

const WIDTH = 340;
const LEFT = 60;
const RIGHT = 324;
const BOTTOM = 240;
const AXIS_TOP = 51.6;
const AXIS_BOTTOM = 208.6;

/** Price over time with a soft area, the alert target band and the period low. */
export function PriceLineChart({
  values,
  minValue,
  maxValue,
  ticks,
  xLabels,
  target,
  minLabel,
  describePoint,
  accessibilityLabel,
}: PriceLineChartProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const x = (index: number) => LEFT + (index / (values.length - 1)) * (RIGHT - LEFT);
  const y = (value: number) =>
    AXIS_BOTTOM - ((value - minValue) / (maxValue - minValue)) * (AXIS_BOTTOM - AXIS_TOP);
  const line = values
    .map((value, index) => `${index === 0 ? 'M' : 'L'}${x(index)},${y(value)}`)
    .join(' ');
  const last = values.length - 1;
  const lowIndex = values.indexOf(Math.min(...values));
  const targetColor =
    target?.tone === 'positive' ? colors.positive.DEFAULT : colors.negative.DEFAULT;
  const lastY = y(values[last] ?? minValue);

  return (
    <ChartFrame
      width={WIDTH}
      height={270}
      accessibilityLabel={accessibilityLabel}
      tooltip={selected !== null && describePoint ? describePoint(selected) : null}
    >
      <Defs>
        <LinearGradient id="pg" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor={colors.foreground.DEFAULT} stopOpacity={0.18} />
          <Stop offset="1" stopColor={colors.foreground.DEFAULT} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {ticks.map((tick) => [
        <Line
          key={`g-${tick.value}`}
          x1={LEFT}
          x2={RIGHT}
          y1={y(tick.value)}
          y2={y(tick.value)}
          stroke={colors.chart.grid}
          strokeDasharray="2 4"
        />,
        <AxisLabel
          key={`t-${tick.value}`}
          x={50}
          y={y(tick.value) + 4.5}
          label={tick.label}
          anchor="end"
          size={11}
        />,
      ])}
      {target ? (
        <>
          <Rect
            x={LEFT}
            y={Math.min(y(target.value), lastY)}
            width={RIGHT - LEFT}
            height={Math.abs(lastY - y(target.value))}
            fill={targetColor}
            opacity={0.08}
          />
          <Line
            x1={LEFT}
            x2={RIGHT}
            y1={y(target.value)}
            y2={y(target.value)}
            stroke={targetColor}
            strokeWidth={2}
            strokeDasharray="6 5"
          />
          <AxisLabel
            x={50}
            y={y(target.value) + 4.5}
            label={target.axisLabel}
            anchor="end"
            size={11}
            strong
            color={targetColor}
          />
          <AxisLabel
            x={68}
            y={y(target.value) - 10}
            label={target.label}
            anchor="start"
            size={13}
            strong
            color={targetColor}
          />
        </>
      ) : null}
      <Path d={`${line} L${x(last)},${BOTTOM} L${x(0)},${BOTTOM} Z`} fill="url(#pg)" />
      <Path
        d={line}
        fill="none"
        stroke={colors.foreground.DEFAULT}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {values.map((value, index) => (
        <Circle
          key={index}
          cx={x(index)}
          cy={y(value)}
          r={8}
          fill="transparent"
          onPress={() => setSelected((current) => (current === index ? null : index))}
        />
      ))}
      <Circle
        cx={x(last)}
        cy={lastY}
        r={6}
        fill={colors.surface.DEFAULT}
        stroke={colors.foreground.DEFAULT}
        strokeWidth={2.5}
      />
      {minLabel ? (
        <>
          <Circle
            cx={x(lowIndex)}
            cy={y(values[lowIndex] ?? minValue)}
            r={4}
            fill={colors.foreground.subtle}
          />
          <AxisLabel
            x={x(lowIndex)}
            y={y(values[lowIndex] ?? minValue) + 21}
            label={minLabel}
            size={11}
            color={colors.foreground.muted}
          />
        </>
      ) : null}
      {xLabels.map((item) => (
        <AxisLabel
          key={item.label}
          x={x(item.index)}
          y={260}
          label={item.label}
          size={11}
          anchor={item.index === 0 ? 'start' : item.index === last ? 'end' : 'middle'}
        />
      ))}
    </ChartFrame>
  );
}
