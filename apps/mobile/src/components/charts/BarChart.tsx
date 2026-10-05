import { colors } from '@guara/ui-tokens';
import { useState } from 'react';
import { Line, Path, Rect } from 'react-native-svg';

import { AxisLabel, ChartFrame, GridLines } from './ChartFrame';

export interface BarDatum {
  label: string;
  value: number;
  /** Full color + value written above the bar. */
  highlight?: boolean;
  /** Text above a highlighted bar ("R$ 6.410"). */
  valueLabel?: string;
  /** Dashed outline up to this value (forecast). */
  forecast?: number;
  /** Tooltip text when tapped. */
  description: string;
}

export interface BarChartProps {
  data: readonly BarDatum[];
  maxValue: number;
  ticks: readonly { value: number; label: string }[];
  /** Dashed reference line ("média R$ 5.812"). */
  average?: { value: number; label: string };
  color?: string;
  /** Opacity of the non-highlighted bars (design: .55 or .45). */
  dimOpacity?: number;
  /** Left edge of the plot (design: 40 or 36). */
  left?: number;
  barWidth?: number;
  /** Canvas geometry (default: 360×230 with the plot from y 46 to 190). */
  geometry?: {
    width: number;
    height: number;
    right: number;
    top: number;
    bottom: number;
    labelY: number;
  };
  accessibilityLabel: string;
}

const DEFAULT_GEOMETRY = { width: 360, height: 230, right: 352, top: 46, bottom: 190, labelY: 208 };

/** Rounded-top bars with dashed grid, optional forecast outline and average line. */
export function BarChart({
  data,
  maxValue,
  ticks,
  average,
  color = colors.chart.out,
  dimOpacity = 0.55,
  left = 40,
  barWidth = 34,
  geometry = DEFAULT_GEOMETRY,
  accessibilityLabel,
}: BarChartProps) {
  const { width: WIDTH, height: HEIGHT, right: RIGHT, top: TOP, bottom: BOTTOM, labelY } = geometry;
  const [selected, setSelected] = useState<number | null>(null);
  const y = (value: number) => BOTTOM - (value / maxValue) * (BOTTOM - TOP);
  const slot = (RIGHT - left) / data.length;
  const radius = 4;

  return (
    <ChartFrame
      width={WIDTH}
      height={HEIGHT}
      accessibilityLabel={accessibilityLabel}
      tooltip={selected !== null ? data[selected]?.description : null}
    >
      <GridLines ticks={ticks} y={y} left={left} right={RIGHT} labelX={left - 8} />
      {data.map((bar, index) => {
        const x = left + slot * index + (slot - barWidth) / 2;
        const top = y(bar.value);
        const d = `M${x},${BOTTOM} V${top + radius} Q${x},${top} ${x + radius},${top} H${x + barWidth - radius} Q${x + barWidth},${top} ${x + barWidth},${top + radius} V${BOTTOM} Z`;
        const center = x + barWidth / 2;
        return [
          bar.forecast !== undefined ? (
            <Rect
              key={`f-${index}`}
              x={x}
              y={y(bar.forecast)}
              width={barWidth}
              height={BOTTOM - y(bar.forecast)}
              rx={4}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
          ) : null,
          <Path
            key={`b-${index}`}
            d={d}
            fill={color}
            fillOpacity={bar.highlight ? 1 : dimOpacity}
            onPress={() => setSelected((current) => (current === index ? null : index))}
          />,
          bar.valueLabel ? (
            <AxisLabel
              key={`v-${index}`}
              x={center}
              y={Math.min(top, bar.forecast !== undefined ? y(bar.forecast) : top) - 8}
              label={bar.valueLabel}
              strong
            />
          ) : null,
          bar.label ? (
            <AxisLabel
              key={`x-${bar.label}-${index}`}
              x={center}
              y={labelY}
              label={bar.label}
              strong={bar.highlight}
              size={labelY === 208 ? 12 : 11}
            />
          ) : null,
        ];
      })}
      {average ? (
        <>
          <Line
            x1={left}
            x2={RIGHT}
            y1={y(average.value)}
            y2={y(average.value)}
            stroke={colors.foreground.muted}
            strokeWidth={1.5}
            strokeDasharray="2 4"
          />
          <AxisLabel
            x={left + 4}
            y={y(average.value) - 6}
            label={average.label}
            anchor="start"
            color={colors.foreground.muted}
          />
        </>
      ) : null}
      <Line x1={left} x2={RIGHT} y1={BOTTOM} y2={BOTTOM} stroke={colors.chart.axis} />
    </ChartFrame>
  );
}
