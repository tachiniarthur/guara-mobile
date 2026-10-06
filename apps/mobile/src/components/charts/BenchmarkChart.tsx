import { colors } from '@guara/ui-tokens';
import { useState } from 'react';
import { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import { AxisLabel, ChartFrame } from './ChartFrame';

export interface BenchmarkChartProps {
  asset: readonly number[];
  benchmark: readonly number[];
  /** Grid values and their y positions on the 357×240 canvas. */
  ticks: readonly number[];
  tickYs: readonly number[];
  formatTick: (value: number) => string;
  /** Month labels spread along the x axis. */
  xLabels?: readonly string[];
  describePoint?: (index: number) => string;
  /** Tablet canvas (720×320, month by month). `tickYs` stay in the 357×240 scale. */
  wide?: boolean;
  /** Dashed line color (default Seriema for the CDI; Arara-azul for an index). */
  benchmarkColor?: string;
  /** Only the asset ("Comparar com: Nenhum"). */
  hideBenchmark?: boolean;
  accessibilityLabel: string;
}

const LEFT = 4;
const COMPACT = {
  width: 357,
  height: 240,
  right: 293,
  bottom: 206,
  tickX: 355,
  labelY: 232,
  font: 11,
  line: 2,
  dash: 1.5,
  gap: '5 4',
};
const WIDE = {
  width: 720,
  height: 320,
  right: 642,
  bottom: 286,
  tickX: 718,
  labelY: 312,
  font: 13,
  line: 2.2,
  dash: 1.6,
  gap: '6 4',
};
/** The wide canvas stretches the compact y scale (grid at 37.6 and 264.4 instead of 31.2 and 190.8). */
const WIDE_SCALE = (264.4 - 37.6) / (190.8 - 31.2);
const WIDE_LABELS = [
  'Set',
  'Out',
  'Nov',
  'Dez',
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
];

/** Asset (Folha, soft area) against a benchmark (dashed), with labels on the right. */
export function BenchmarkChart({
  asset,
  benchmark,
  ticks,
  tickYs,
  formatTick,
  xLabels,
  describePoint,
  wide = false,
  benchmarkColor = colors.foreground.subtle,
  hideBenchmark = false,
  accessibilityLabel,
}: BenchmarkChartProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const { width, height, right, bottom, ...canvas } = wide ? WIDE : COMPACT;
  const labels =
    xLabels ?? (wide ? WIDE_LABELS : ['Set', 'Nov', 'Jan', 'Mar', 'Mai', 'Jul', 'Set']);
  const toCanvas = (compactY: number) => (wide ? 37.6 + (compactY - 31.2) * WIDE_SCALE : compactY);
  const [v0 = 0, v1 = 1] = [ticks[0], ticks[ticks.length - 1]];
  const [y0 = 0, y1 = 0] = [tickYs[0], tickYs[tickYs.length - 1]];
  const y = (value: number) => toCanvas(y0 + ((value - v0) * (y1 - y0)) / (v1 - v0));
  const x = (index: number, count: number) => LEFT + (index / (count - 1)) * (right - LEFT);
  const line = (values: readonly number[]) =>
    values
      .map(
        (value, index) =>
          `${index === 0 ? 'M' : 'L'}${x(index, values.length).toFixed(1)},${y(value).toFixed(1)}`,
      )
      .join(' ');
  const last = asset.length - 1;
  const lastY = y(asset[last] ?? v0);
  const step = asset.length / 20;

  return (
    <ChartFrame
      width={width}
      height={height}
      accessibilityLabel={accessibilityLabel}
      tooltip={selected !== null && describePoint ? describePoint(selected) : null}
    >
      <Defs>
        <LinearGradient id="bench" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor={colors.positive.DEFAULT} stopOpacity={0.22} />
          <Stop offset="1" stopColor={colors.positive.DEFAULT} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {ticks.map((tick, index) => [
        <Line
          key={`g-${tick}`}
          x1={LEFT}
          x2={right}
          y1={toCanvas(tickYs[index] ?? 0)}
          y2={toCanvas(tickYs[index] ?? 0)}
          stroke={colors.chart.grid}
        />,
        <AxisLabel
          key={`t-${tick}`}
          x={canvas.tickX}
          y={toCanvas(tickYs[index] ?? 0) + canvas.font * 0.38}
          label={formatTick(tick)}
          anchor="end"
          size={canvas.font}
        />,
      ])}
      <Path d={`${line(asset)} L${right},${bottom} L${LEFT},${bottom} Z`} fill="url(#bench)" />
      {hideBenchmark ? null : (
        <Path
          d={line(benchmark)}
          fill="none"
          stroke={benchmarkColor}
          strokeWidth={canvas.dash}
          strokeDasharray={canvas.gap}
        />
      )}
      <Path
        d={line(asset)}
        fill="none"
        stroke={colors.positive.DEFAULT}
        strokeWidth={canvas.line}
        strokeLinejoin="round"
      />
      {Array.from({ length: 20 }, (_, slot) => {
        const index = Math.min(last, Math.round(slot * step));
        return (
          <Circle
            key={slot}
            cx={x(index, asset.length)}
            cy={y(asset[index] ?? v0)}
            r={9}
            fill="transparent"
            onPress={() => setSelected((current) => (current === index ? null : index))}
          />
        );
      })}
      <Circle cx={right} cy={lastY} r={7} fill={colors.positive.DEFAULT} opacity={0.25} />
      <Circle cx={right} cy={lastY} r={4} fill={colors.positive.DEFAULT} />
      {labels.map((label, index) => (
        <AxisLabel
          key={`${label}-${index}`}
          x={LEFT + (index / (labels.length - 1)) * (right - LEFT)}
          y={canvas.labelY}
          label={label}
          size={canvas.font}
          anchor={index === 0 ? 'start' : index === labels.length - 1 ? 'end' : 'middle'}
        />
      ))}
    </ChartFrame>
  );
}
