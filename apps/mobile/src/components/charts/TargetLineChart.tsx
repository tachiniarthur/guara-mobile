import { colors } from '@guara/ui-tokens';
import { Circle, Line, Path } from 'react-native-svg';

import { AxisLabel, ChartFrame } from './ChartFrame';

export interface TargetLineChartProps {
  values: readonly number[];
  /** Scale of the plot; `ticks` are drawn as grid lines. */
  minValue: number;
  maxValue: number;
  ticks: readonly { value: number; label: string }[];
  /** The alert's target, dashed in Folha ("alvo R$ 650.000"). */
  target: { value: number; label: string };
  /** X labels with their point index. */
  xLabels: readonly { index: number; label: string }[];
  accessibilityLabel: string;
}

const WIDTH = 340;
const LEFT = 52;
const RIGHT = 330;
const TOP = 30.9;
const BOTTOM = 135.5;
const FLOOR = 148;

/** Price of the last days in Tucano against the alert's target (detail of a price alert). */
export function TargetLineChart({
  values,
  minValue,
  maxValue,
  ticks,
  target,
  xLabels,
  accessibilityLabel,
}: TargetLineChartProps) {
  const x = (index: number) => LEFT + (index / Math.max(1, values.length - 1)) * (RIGHT - LEFT);
  const y = (value: number) =>
    BOTTOM - ((value - minValue) / (maxValue - minValue)) * (BOTTOM - TOP);
  const line = values
    .map(
      (value, index) => `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)},${y(value).toFixed(1)}`,
    )
    .join(' ');
  const area = `${line} L${RIGHT},${FLOOR} L${LEFT},${FLOOR} Z`;
  const last = values.length - 1;
  const targetY = y(target.value);
  return (
    <ChartFrame width={WIDTH} height={170} accessibilityLabel={accessibilityLabel}>
      {ticks.map((tick) => [
        <Line
          key={`l-${tick.value}`}
          x1={LEFT}
          x2={RIGHT}
          y1={y(tick.value)}
          y2={y(tick.value)}
          stroke={colors.border.DEFAULT}
        />,
        <AxisLabel
          key={`t-${tick.value}`}
          x={46}
          y={y(tick.value) + 4}
          label={tick.label}
          anchor="end"
          size={10}
        />,
      ])}
      <Line
        x1={LEFT}
        x2={RIGHT}
        y1={targetY}
        y2={targetY}
        stroke={colors.positive.DEFAULT}
        strokeWidth={1.5}
        strokeDasharray="6 5"
      />
      <AxisLabel
        x={RIGHT}
        y={targetY - 5}
        label={target.label}
        anchor="end"
        strong
        size={10}
        color={colors.positive.DEFAULT}
      />
      <Path d={area} fill={colors.brand.DEFAULT} opacity={0.12} />
      <Path
        d={line}
        fill="none"
        stroke={colors.brand.DEFAULT}
        strokeWidth={2.4}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Circle cx={x(last)} cy={y(values[last] ?? minValue)} r={3.5} fill={colors.brand.DEFAULT} />
      {xLabels.map((item, index) => (
        <AxisLabel
          key={item.label}
          x={x(item.index)}
          y={164}
          label={item.label}
          size={10}
          anchor={index === 0 ? 'start' : index === xLabels.length - 1 ? 'end' : 'middle'}
        />
      ))}
    </ChartFrame>
  );
}
