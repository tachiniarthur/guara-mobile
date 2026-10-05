import { colors } from '@guara/ui-tokens';
import { Line, Rect } from 'react-native-svg';

import { AxisLabel, ChartFrame } from './ChartFrame';

export interface CapBarChartProps {
  /** Monthly totals (whole reais); the last one is the current month. */
  data: readonly { label: string; value: number }[];
  /** Cap being created (whole reais). */
  cap: number;
  /** Average of the last 3 months (whole reais). */
  average: number;
  maxValue: number;
  format: (value: number) => string;
  accessibilityLabel: string;
}

const WIDTH = 340;
const BOTTOM = 200;
const TOP = 56.7;
const BAR = 38.9;

/**
 * Months of a category against a new cap: bars over the cap in Urucum, current month in
 * Arara-azul, the cap dashed in Tucano and the 3-month average dotted.
 */
export function CapBarChart({
  data,
  cap,
  average,
  maxValue,
  format,
  accessibilityLabel,
}: CapBarChartProps) {
  const y = (value: number) => BOTTOM - (value / maxValue) * (BOTTOM - TOP);
  const slot = WIDTH / data.length;
  return (
    <ChartFrame width={WIDTH} height={230} accessibilityLabel={accessibilityLabel}>
      <Line x1={0} x2={WIDTH} y1={BOTTOM} y2={BOTTOM} stroke={colors.chart.axis} />
      <Line
        x1={0}
        x2={WIDTH}
        y1={y(average)}
        y2={y(average)}
        stroke={colors.foreground.subtle}
        strokeWidth={1.5}
        strokeDasharray="2 5"
      />
      <Line
        x1={0}
        x2={WIDTH}
        y1={y(cap)}
        y2={y(cap)}
        stroke={colors.brand.DEFAULT}
        strokeWidth={2}
        strokeDasharray="6 5"
      />
      {data.map((bar, index) => {
        const isCurrent = index === data.length - 1;
        const over = bar.value > cap;
        const x = slot * index + (slot - BAR) / 2;
        const fill = over
          ? colors.negative.DEFAULT
          : isCurrent
            ? colors.info.DEFAULT
            : colors.chart.inMuted;
        return [
          <Rect
            key={`b-${bar.label}`}
            x={x}
            y={y(bar.value)}
            width={BAR}
            height={BOTTOM - y(bar.value)}
            rx={6}
            fill={fill}
          />,
          <AxisLabel
            key={`v-${bar.label}`}
            x={x + BAR / 2}
            y={y(bar.value) + 18}
            label={format(bar.value)}
            strong
            color={over || isCurrent ? colors.foreground.inverse : colors.foreground.DEFAULT}
          />,
          <AxisLabel key={`x-${bar.label}`} x={x + BAR / 2} y={218} label={bar.label} size={11} />,
        ];
      })}
      <AxisLabel
        x={336}
        y={y(cap) - 8}
        label={`teto novo ${format(cap)}`}
        anchor="end"
        strong
        size={11}
        color={colors.brand.DEFAULT}
      />
    </ChartFrame>
  );
}
