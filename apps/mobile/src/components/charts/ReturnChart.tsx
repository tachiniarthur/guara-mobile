import { colors } from '@guara/ui-tokens';
import { Circle, Line, Path } from 'react-native-svg';

import { AxisLabel, ChartFrame } from './ChartFrame';

export interface ReturnChartProps {
  /** Cumulative return in percent per period. */
  portfolio: readonly number[];
  benchmark: readonly number[];
  labels: readonly string[];
  portfolioLabel: string;
  benchmarkLabel: string;
  accessibilityLabel: string;
}

const WIDTH = 320;
const LEFT = 10;
const RIGHT = 310;
const ZERO = 105.3;
const PX_PER_POINT = 7.33;

/** Portfolio return (Folha) against the CDI (dashed). */
export function ReturnChart({
  portfolio,
  benchmark,
  labels,
  portfolioLabel,
  benchmarkLabel,
  accessibilityLabel,
}: ReturnChartProps) {
  const x = (index: number) => LEFT + (index / (portfolio.length - 1)) * (RIGHT - LEFT);
  const y = (value: number) => ZERO - value * PX_PER_POINT;
  const path = (values: readonly number[]) =>
    values.map((value, index) => `${index === 0 ? 'M' : 'L'}${x(index)},${y(value)}`).join(' ');
  const last = portfolio.length - 1;
  return (
    <ChartFrame width={WIDTH} height={150} accessibilityLabel={accessibilityLabel}>
      {[0, 5, 10].map((tick) => (
        <Line
          key={tick}
          x1={0}
          x2={WIDTH}
          y1={y(tick)}
          y2={y(tick)}
          stroke={colors.chart.grid}
          strokeDasharray="2 4"
        />
      ))}
      <Path
        d={path(benchmark)}
        fill="none"
        stroke={colors.foreground.subtle}
        strokeWidth={1.5}
        strokeDasharray="5 4"
      />
      <Path
        d={path(portfolio)}
        fill="none"
        stroke={colors.positive.DEFAULT}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
      <Circle
        cx={x(last)}
        cy={y(portfolio[last] ?? 0)}
        r={4}
        fill={colors.surface.DEFAULT}
        stroke={colors.positive.DEFAULT}
        strokeWidth={2}
      />
      <AxisLabel
        x={RIGHT - 10}
        y={y(portfolio[last] ?? 0) - 11}
        label={portfolioLabel}
        anchor="end"
        strong
        color={colors.positive.DEFAULT}
      />
      <AxisLabel
        x={RIGHT - 10}
        y={72}
        label={benchmarkLabel}
        anchor="end"
        color={colors.foreground.muted}
      />
      {labels.map((label, index) =>
        index % 2 === 1 ? (
          <AxisLabel key={label} x={x(index)} y={146} label={label} size={11} />
        ) : null,
      )}
    </ChartFrame>
  );
}
