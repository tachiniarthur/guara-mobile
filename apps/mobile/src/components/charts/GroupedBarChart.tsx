import { colors } from '@guara/ui-tokens';
import { Line, Rect } from 'react-native-svg';

import { AxisLabel, ChartFrame } from './ChartFrame';

export interface GroupedBarDatum {
  label: string;
  /** Values of each series (same order as `series`). */
  values: readonly number[];
}

export interface GroupedBarChartProps {
  data: readonly GroupedBarDatum[];
  series: readonly { color: string }[];
  maxValue: number;
  ticks: readonly number[];
  /** "7,2" — the label written above each bar. */
  format: (value: number) => string;
  accessibilityLabel: string;
}

const WIDTH = 340;
const LEFT = 52;
const RIGHT = 324;
const BOTTOM = 206;
const TOP = 40;
const BAR = 19;
const GAP = 4;

/** Side-by-side bars per group (money in and out per week). Zero shows a "0" label. */
export function GroupedBarChart({
  data,
  series,
  maxValue,
  ticks,
  format,
  accessibilityLabel,
}: GroupedBarChartProps) {
  const y = (value: number) => BOTTOM - (value / maxValue) * (BOTTOM - TOP);
  const slot = (RIGHT - LEFT) / data.length;
  const groupWidth = series.length * BAR + (series.length - 1) * GAP;

  return (
    <ChartFrame width={WIDTH} height={240} accessibilityLabel={accessibilityLabel}>
      {ticks.map((tick, index) => (
        <Line
          key={tick}
          x1={LEFT}
          x2={RIGHT}
          y1={y(tick)}
          y2={y(tick)}
          stroke={index === 0 ? colors.chart.axis : colors.chart.grid}
          strokeDasharray={index === 0 ? undefined : '2 4'}
        />
      ))}
      {ticks.map((tick) => (
        <AxisLabel
          key={`t-${tick}`}
          x={LEFT - 8}
          y={y(tick) + 4}
          label={String(tick)}
          anchor="end"
          size={11}
        />
      ))}
      {data.map((group, groupIndex) => {
        const start = LEFT + slot * groupIndex + (slot - groupWidth) / 2;
        return [
          ...group.values.map((value, seriesIndex) => {
            const x = start + seriesIndex * (BAR + GAP);
            const color = series[seriesIndex]?.color ?? colors.foreground.subtle;
            if (value === 0) {
              return (
                <AxisLabel
                  key={`${group.label}-${seriesIndex}`}
                  x={x + BAR / 2}
                  y={BOTTOM - 8}
                  label="0"
                  size={11}
                />
              );
            }
            return [
              <Rect
                key={`${group.label}-${seriesIndex}`}
                x={x}
                y={y(value)}
                width={BAR}
                height={BOTTOM - y(value)}
                rx={5}
                fill={color}
              />,
              <AxisLabel
                key={`${group.label}-${seriesIndex}-v`}
                x={x + BAR / 2}
                y={y(value) - 8}
                label={format(value)}
                strong
                size={11}
                color={color}
              />,
            ];
          }),
          <AxisLabel
            key={`${group.label}-x`}
            x={start + groupWidth / 2}
            y={230}
            label={group.label}
            size={11}
          />,
        ];
      })}
    </ChartFrame>
  );
}
