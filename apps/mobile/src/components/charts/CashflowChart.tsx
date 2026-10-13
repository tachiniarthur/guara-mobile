import type { Cents } from '@guara/types';
import { colors, fontFamily } from '@guara/ui-tokens';
import { formatCents } from '@guara/utils';
import { View } from 'react-native';
import Svg, { Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';

import { HIDDEN_MONEY } from '@/components/ui/MoneyText';

export interface CashflowChartProps {
  /** Cumulative money in for each day so far (index 0 = day 1). */
  inflow: readonly Cents[];
  /** Cumulative money out for each day so far. */
  outflow: readonly Cents[];
  /** Expected cumulative money out on the last day. */
  outflowForecast: Cents;
  daysInMonth: number;
  /** Top of the Y axis (the axis shows 0, half and this value). */
  maxValue: Cents;
  /** Days labelled on the X axis besides today and the last day. */
  dayTicks?: readonly number[];
  /**
   * `compact` (phone): labels scaled with the chart. `wide` (tablet): small labels and the
   * series totals written on the right.
   */
  variant?: 'compact' | 'wide';
  /** "Ocultar valores": the balance bubble hides its amount. */
  masked?: boolean;
  accessibilityLabel: string;
}

const PLOT_LEFT = 52;
const PLOT_RIGHT = 510;
const PLOT_TOP = 14;
const PLOT_BOTTOM = 140;

const LAYOUT = {
  compact: { viewBox: '-8 0 538 180', width: 538, height: 180, font: 19, tickY: 174, tickX: 44 },
  wide: { viewBox: '0 0 660 170', width: 660, height: 170, font: 12, tickY: 164, tickX: 42 },
} as const;

const reais = (value: Cents) => formatCents(value, { wholeUnits: true });
const thousands = (value: number) => `${Math.floor(value / 100_000)} mil`;

/** Step chart of cumulative money in and out this month, with the end-of-month forecast. */
export function CashflowChart({
  inflow,
  outflow,
  outflowForecast,
  daysInMonth,
  maxValue,
  dayTicks = [1, 10, 20],
  variant = 'compact',
  masked = false,
  accessibilityLabel,
}: CashflowChartProps) {
  const layout = LAYOUT[variant];
  const today = Math.max(inflow.length, outflow.length);
  const x = (day: number) => PLOT_LEFT + ((day - 1) / (daysInMonth - 1)) * (PLOT_RIGHT - PLOT_LEFT);
  const y = (value: number) => PLOT_BOTTOM - (value / maxValue) * (PLOT_BOTTOM - PLOT_TOP);

  /** Corners of the step line: flat until the next day, then the jump. */
  const stepPoints = (values: readonly number[]) =>
    values.flatMap((value, index) => {
      if (index === 0) return [[x(1), y(value)]];
      return [
        [x(index + 1), y(values[index - 1] ?? value)],
        [x(index + 1), y(value)],
      ];
    });
  const stepPath = (values: readonly number[]) =>
    stepPoints(values)
      .map(([px, py], index) => `${index === 0 ? 'M' : 'L'}${px},${py}`)
      .join(' ');

  const lastIn = inflow[inflow.length - 1] ?? (0 as Cents);
  const lastOut = outflow[outflow.length - 1] ?? (0 as Cents);
  const todayX = x(today);
  const area = [...stepPoints(inflow), ...stepPoints(outflow).reverse()]
    .map(([px, py]) => `${px},${py}`)
    .join(' ');

  const pill =
    variant === 'compact'
      ? { width: 200, height: 40, top: 18, font: 19 }
      : { width: 140, height: 30, top: y(lastIn) + 1, font: 13 };
  const pillCenter = todayX - 80;
  const balance = (lastIn - lastOut) as Cents;
  const ticks = [0, maxValue / 2, maxValue];
  const text = (weight: 'regular' | 'extrabold') =>
    weight === 'extrabold' ? fontFamily.extrabold : fontFamily.regular;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={{ width: '100%', maxWidth: layout.width, aspectRatio: layout.width / layout.height }}
    >
      <Svg width="100%" height="100%" viewBox={layout.viewBox}>
        {ticks.map((tick) => (
          <Line
            key={`grid-${tick}`}
            x1={PLOT_LEFT}
            x2={PLOT_RIGHT}
            y1={y(tick)}
            y2={y(tick)}
            stroke={colors.chart.grid}
            strokeDasharray="3 5"
          />
        ))}
        {ticks.map((tick) => (
          <SvgText
            key={`label-${tick}`}
            x={layout.tickX}
            y={y(tick) + 4}
            textAnchor="end"
            fontSize={layout.font}
            fill={colors.foreground.subtle}
            fontFamily={text('regular')}
          >
            {thousands(tick)}
          </SvgText>
        ))}
        <Polygon points={area} fill={colors.chart.in} fillOpacity={0.14} />
        <Path
          d={stepPath(inflow)}
          fill="none"
          stroke={colors.chart.in}
          strokeWidth={3.5}
          strokeLinejoin="round"
        />
        <Path
          d={stepPath(outflow)}
          fill="none"
          stroke={colors.chart.out}
          strokeWidth={3.5}
          strokeLinejoin="round"
        />
        <Path
          d={`M${todayX},${y(lastIn)} H${x(daysInMonth)}`}
          stroke={colors.chart.in}
          strokeWidth={2.5}
          strokeDasharray="6 6"
          fill="none"
        />
        <Path
          d={`M${todayX},${y(lastOut)} L${x(daysInMonth)},${y(outflowForecast)}`}
          stroke={colors.chart.out}
          strokeWidth={2.5}
          strokeDasharray="6 6"
          fill="none"
        />
        {variant === 'wide' ? (
          <>
            <SvgText
              x={520}
              y={y(lastIn) + 5}
              fontSize={13}
              fill={colors.chart.in}
              fontFamily={text('extrabold')}
            >
              {`Entradas ${reais(lastIn)}`}
            </SvgText>
            <SvgText
              x={520}
              y={y(outflowForecast) + 5}
              fontSize={13}
              fill={colors.chart.out}
              fontFamily={text('extrabold')}
            >
              {`Saídas ${reais(outflowForecast)}`}
            </SvgText>
            <SvgText
              x={520}
              y={y(outflowForecast) + 21}
              fontSize={12}
              fill={colors.foreground.subtle}
              fontFamily={text('regular')}
            >
              {`previsão até dia ${daysInMonth}`}
            </SvgText>
          </>
        ) : null}
        <Rect
          x={pillCenter - pill.width / 2}
          y={pill.top}
          width={pill.width}
          height={pill.height}
          rx={pill.height / 2}
          fill={colors.foreground.DEFAULT}
        />
        <SvgText
          x={pillCenter}
          y={pill.top + pill.height / 2 + pill.font * 0.35}
          textAnchor="middle"
          fontSize={pill.font}
          fill={colors.foreground.inverse}
          fontFamily={text('extrabold')}
        >
          {`Sobrou ${masked ? HIDDEN_MONEY : reais(balance)}`}
        </SvgText>
        <Line
          x1={PLOT_LEFT}
          x2={PLOT_RIGHT}
          y1={PLOT_BOTTOM}
          y2={PLOT_BOTTOM}
          stroke={colors.chart.axis}
        />
        {[...dayTicks, today, daysInMonth].map((day) => {
          const isToday = day === today;
          return (
            <SvgText
              key={`day-${day}`}
              x={x(day)}
              y={layout.tickY}
              textAnchor="middle"
              fontSize={layout.font}
              fill={isToday ? colors.foreground.DEFAULT : colors.foreground.subtle}
              fontFamily={text(isToday ? 'extrabold' : 'regular')}
            >
              {isToday ? 'hoje' : String(day)}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
