import { colors } from '@guara/ui-tokens';
import { useState } from 'react';
import { Circle, Line, Path, Rect } from 'react-native-svg';

import { AxisLabel, ChartFrame, GridLines } from './ChartFrame';

export interface QuoteChartProps {
  values: readonly number[];
  minValue: number;
  maxValue: number;
  ticks: readonly number[];
  /** User's average price line ("Seu preço médio R$ 35,10"). */
  averagePrice?: { value: number; label: string };
  format: (value: number) => string;
  xLabels: readonly string[];
  /** Month of each point (tooltip). */
  describePoint?: (index: number) => string;
  /** Tablet canvas (620×260). */
  wide?: boolean;
  accessibilityLabel: string;
}

const LEFT = 50;
const TOP = 16;
const COMPACT = { width: 340, height: 230, right: 256, bottom: 204, labelY: 222 };
const WIDE = { width: 620, height: 260, right: 536, bottom: 234, labelY: 252 };

/** Daily price with area, average-price line, high/low markers and the last price. */
export function QuoteChart({
  values,
  minValue,
  maxValue,
  ticks,
  averagePrice,
  format,
  xLabels,
  describePoint,
  wide = false,
  accessibilityLabel,
}: QuoteChartProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const { width, height, right, bottom, labelY } = wide ? WIDE : COMPACT;
  const y = (value: number) =>
    bottom - ((value - minValue) / (maxValue - minValue)) * (bottom - TOP);
  const x = (index: number) => LEFT + (index / Math.max(1, values.length - 1)) * (right - LEFT);
  const line = values
    .map(
      (value, index) => `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)},${y(value).toFixed(1)}`,
    )
    .join(' ');
  const high = values.indexOf(Math.max(...values));
  const low = values.indexOf(Math.min(...values));
  const last = values.length - 1;
  const slot = (right - LEFT) / values.length;

  return (
    <ChartFrame
      width={width}
      height={height}
      accessibilityLabel={accessibilityLabel}
      tooltip={selected !== null && describePoint ? describePoint(selected) : null}
    >
      <GridLines
        ticks={ticks.map((value) => ({ value, label: String(value) }))}
        y={y}
        left={LEFT}
        right={right}
        labelX={42}
      />
      <Path
        d={`${line} L${right},${bottom} L${LEFT},${bottom} Z`}
        fill={colors.info.DEFAULT}
        fillOpacity={0.12}
      />
      <Path
        d={line}
        fill="none"
        stroke={colors.info.DEFAULT}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {averagePrice && averagePrice.value >= minValue && averagePrice.value <= maxValue ? (
        <>
          <Line
            x1={LEFT}
            x2={right}
            y1={y(averagePrice.value)}
            y2={y(averagePrice.value)}
            stroke={colors.brand.DEFAULT}
            strokeWidth={1.5}
            strokeDasharray="6 5"
          />
          <AxisLabel
            x={56}
            y={y(averagePrice.value) - 6}
            label={averagePrice.label}
            anchor="start"
            strong
            color={colors.foreground.muted}
          />
        </>
      ) : null}
      <Circle
        cx={x(high)}
        cy={y(values[high] ?? 0)}
        r={4}
        fill={colors.surface.DEFAULT}
        stroke={colors.foreground.muted}
        strokeWidth={2}
      />
      <AxisLabel
        x={x(high)}
        y={y(values[high] ?? 0) - 10}
        label={`máx ${format(values[high] ?? 0)}`}
        color={colors.foreground.muted}
      />
      <Circle
        cx={x(low)}
        cy={y(values[low] ?? 0)}
        r={4}
        fill={colors.surface.DEFAULT}
        stroke={colors.foreground.muted}
        strokeWidth={2}
      />
      <AxisLabel
        x={x(low) + 10}
        y={y(values[low] ?? 0) + 4}
        label={`mín ${format(values[low] ?? 0)}`}
        anchor="start"
        color={colors.foreground.muted}
      />
      {values.map((_, index) => (
        <Rect
          key={index}
          x={x(index) - slot / 2}
          y={TOP}
          width={slot}
          height={bottom - TOP}
          fill="transparent"
          onPress={() => setSelected((current) => (current === index ? null : index))}
        />
      ))}
      {selected !== null ? (
        <Line x1={x(selected)} x2={x(selected)} y1={TOP} y2={bottom} stroke={colors.chart.axis} />
      ) : null}
      <Circle
        cx={x(last)}
        cy={y(values[last] ?? 0)}
        r={5}
        fill={colors.info.DEFAULT}
        stroke={colors.surface.DEFAULT}
        strokeWidth={2}
      />
      <AxisLabel
        x={x(last) + 10}
        y={y(values[last] ?? 0) + 4}
        label={format(values[last] ?? 0)}
        anchor="start"
        strong
        size={13}
      />
      <Line x1={LEFT} x2={right} y1={bottom} y2={bottom} stroke={colors.chart.axis} />
      {xLabels.map((label, index) => (
        <AxisLabel
          key={label}
          x={LEFT + (index / (xLabels.length - 1)) * (right - LEFT)}
          y={labelY}
          label={label}
        />
      ))}
    </ChartFrame>
  );
}
