import { colors } from '@guara/ui-tokens';
import { useState } from 'react';
import { Circle, Line, Path } from 'react-native-svg';

import { AxisLabel, ChartFrame, GridLines } from './ChartFrame';

export interface PaceChartProps {
  /** Cumulative values of the current period, one per day so far. */
  current: readonly number[];
  /** Cumulative values of the comparison period (whole period). */
  previous: readonly number[];
  daysInPeriod: number;
  maxValue: number;
  ticks: readonly { value: number; label: string }[];
  currentLabel: string;
  previousLabel: string;
  /** Label at the end of the comparison line (tablet: "R$ 6.290"). */
  previousEndLabel?: string;
  /** `compact` (phone, 360 wide) or `wide` (tablet, 540 wide). */
  variant?: 'compact' | 'wide';
  /** Tooltip text of a day (1-based). */
  describeDay: (day: number) => string;
  accessibilityLabel: string;
}

const LAYOUT = {
  compact: { width: 360, left: 40, right: 238, labelX: 32 },
  wide: { width: 540, left: 48, right: 470, labelX: 40 },
} as const;
const TOP = 42.6;
const BOTTOM = 190;

/** Cumulative spending of this month against last month ("Ritmo do mês"). */
export function PaceChart({
  current,
  previous,
  daysInPeriod,
  maxValue,
  ticks,
  currentLabel,
  previousLabel,
  previousEndLabel,
  variant = 'compact',
  describeDay,
  accessibilityLabel,
}: PaceChartProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const layout = LAYOUT[variant];
  const x = (day: number) =>
    layout.left + ((day - 1) / (daysInPeriod - 1)) * (layout.right - layout.left);
  const y = (value: number) => BOTTOM - (value / maxValue) * (BOTTOM - TOP);
  const line = (values: readonly number[]) =>
    values.map((value, index) => `${index === 0 ? 'M' : 'L'}${x(index + 1)},${y(value)}`).join(' ');
  const today = current.length;
  const todayX = x(today);
  const area = `${line(current)} L${todayX},${BOTTOM} L${x(1)},${BOTTOM} Z`;
  const lastCurrent = current[today - 1] ?? 0;
  const previousToday = previous[today - 1] ?? 0;
  const previousEnd = previous[previous.length - 1] ?? 0;

  return (
    <ChartFrame
      width={layout.width}
      height={230}
      accessibilityLabel={accessibilityLabel}
      tooltip={selected ? describeDay(selected) : null}
    >
      <GridLines
        ticks={ticks}
        y={y}
        left={layout.left}
        right={layout.right}
        labelX={layout.labelX}
      />
      <Path
        d={line(previous)}
        fill="none"
        stroke={colors.foreground.subtle}
        strokeWidth={2}
        strokeDasharray="6 5"
        strokeLinejoin="round"
      />
      <Path d={area} fill={colors.chart.out} fillOpacity={0.12} />
      <Path
        d={line(current)}
        fill="none"
        stroke={colors.chart.out}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {current.map((value, index) => (
        <Circle
          key={index}
          cx={x(index + 1)}
          cy={y(value)}
          r={9}
          fill="transparent"
          onPress={() => setSelected((day) => (day === index + 1 ? null : index + 1))}
        />
      ))}
      <Line x1={todayX} x2={todayX} y1={18} y2={BOTTOM} stroke={colors.chart.axis} />
      <Circle
        cx={todayX}
        cy={y(lastCurrent)}
        r={5}
        fill={colors.chart.out}
        stroke={colors.surface.DEFAULT}
        strokeWidth={2}
      />
      <AxisLabel
        x={todayX + 10}
        y={y(lastCurrent) + 4}
        label={currentLabel}
        anchor="start"
        strong
        size={13}
      />
      <AxisLabel
        x={todayX + 10}
        y={y(previousToday) + 14}
        label={previousLabel}
        anchor="start"
        color={colors.foreground.muted}
      />
      <Circle
        cx={todayX}
        cy={y(previousToday)}
        r={4}
        fill={colors.foreground.subtle}
        stroke={colors.surface.DEFAULT}
        strokeWidth={2}
      />
      {previousEndLabel ? (
        <AxisLabel
          x={layout.right + 6}
          y={y(previousEnd) + 4}
          label={previousEndLabel}
          anchor="start"
        />
      ) : null}
      <Line x1={layout.left} x2={layout.right} y1={BOTTOM} y2={BOTTOM} stroke={colors.chart.axis} />
      {[1, 10, 20, today, daysInPeriod].map((day) => (
        <AxisLabel
          key={day}
          x={x(day)}
          y={208}
          label={day === today ? 'hoje' : String(day)}
          strong={day === today}
        />
      ))}
    </ChartFrame>
  );
}
