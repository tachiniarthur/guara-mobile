import { colors } from '@guara/ui-tokens';
import { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { AxisLabel, CHART_FONT, ChartFrame } from './ChartFrame';

export interface TrendAreaChartProps {
  /** One value per month, oldest first. */
  values: readonly number[];
  xLabels: readonly string[];
  /** Distance between grid lines, in the values' unit (FIPE: 2.000 reais). */
  step: number;
  formatTick: (value: number) => string;
  accessibilityLabel: string;
}

const WIDTH = 340;
const HEIGHT = 150;
const LEFT = 34;
const RIGHT = 332;
const TOP = 10;
/** Base of the area (half a step under the lowest grid line). */
const BOTTOM = 126;

/**
 * Line with a light area and the last point marked ("Valor na Tabela FIPE"). The grid starts
 * at the step below the lowest value; the area rests half a step under it.
 */
export function TrendAreaChart({
  values,
  xLabels,
  step,
  formatTick,
  accessibilityLabel,
}: TrendAreaChartProps) {
  const lowTick = Math.floor(Math.min(...values) / step) * step;
  const highTick = Math.ceil(Math.max(...values) / step) * step;
  const floor = lowTick - step / 2;
  const ticks: number[] = [];
  for (let tick = lowTick; tick <= highTick; tick += step) ticks.push(tick);
  const y = (value: number) => TOP + ((highTick - value) / (highTick - floor)) * (BOTTOM - TOP);
  const x = (index: number) => LEFT + (index / Math.max(1, values.length - 1)) * (RIGHT - LEFT);
  const line = values
    .map(
      (value, index) => `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)},${y(value).toFixed(1)}`,
    )
    .join(' ');
  const last = values.length - 1;

  return (
    <ChartFrame width={WIDTH} height={HEIGHT} accessibilityLabel={accessibilityLabel}>
      {ticks.map((tick) => (
        <Line
          key={`g-${tick}`}
          x1={LEFT}
          x2={RIGHT}
          y1={y(tick)}
          y2={y(tick)}
          stroke={colors.border.DEFAULT}
        />
      ))}
      {ticks.map((tick) => (
        <SvgText
          key={`t-${tick}`}
          x={28}
          y={y(tick) + 4}
          textAnchor="end"
          fontSize={10}
          fill={colors.foreground.subtle}
          fontFamily={CHART_FONT.regular}
        >
          {formatTick(tick)}
        </SvgText>
      ))}
      <Path
        d={`${line} L${RIGHT},${BOTTOM} L${LEFT},${BOTTOM} Z`}
        fill={colors.info.DEFAULT}
        fillOpacity={0.12}
      />
      <Path
        d={line}
        fill="none"
        stroke={colors.info.DEFAULT}
        strokeWidth={2.4}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Circle cx={x(last)} cy={y(values[last] ?? 0)} r={3.5} fill={colors.info.DEFAULT} />
      {xLabels.map((label, index) => (
        <AxisLabel key={label} x={x(index)} y={144} label={label} size={10} />
      ))}
    </ChartFrame>
  );
}
