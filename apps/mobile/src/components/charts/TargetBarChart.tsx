import { colors } from '@guara/ui-tokens';
import { Path } from 'react-native-svg';

import { AxisLabel, ChartFrame, GridLines } from './ChartFrame';

export interface TargetBarDatum {
  label: string;
  color: string;
  /** Current share in percent. */
  current: number;
  /** Target share in percent. */
  target: number;
  /** Highlight the value label (e.g. far from the target). */
  alert?: boolean;
}

export interface TargetBarChartProps {
  data: readonly TargetBarDatum[];
  accessibilityLabel: string;
}

const WIDTH = 330;
const LEFT = 40;
const RIGHT = 324;
const BOTTOM = 184;
const TOP = 14;
const BAR = 17;
const MAX = 60;

const roundedBar = (x: number, top: number) =>
  `M${x},${BOTTOM} V${top + 4} Q${x},${top} ${x + 4},${top} H${x + BAR - 4} Q${x + BAR},${top} ${x + BAR},${top + 4} V${BOTTOM} Z`;

/** Current share (solid) beside the target (outlined) for each asset class. */
export function TargetBarChart({ data, accessibilityLabel }: TargetBarChartProps) {
  const y = (value: number) => BOTTOM - (value / MAX) * (BOTTOM - TOP);
  const slot = (RIGHT - LEFT) / data.length;
  return (
    <ChartFrame width={WIDTH} height={210} accessibilityLabel={accessibilityLabel}>
      <GridLines
        ticks={[0, 20, 40, 60].map((value) => ({ value, label: `${value}%` }))}
        y={y}
        left={LEFT}
        right={RIGHT}
        labelX={34}
      />
      {data.map((item, index) => {
        const start = LEFT + slot * index + (slot - (BAR * 2 + 2)) / 2;
        return [
          <Path key={`c-${item.label}`} d={roundedBar(start, y(item.current))} fill={item.color} />,
          <Path
            key={`t-${item.label}`}
            d={roundedBar(start + BAR + 2, y(item.target))}
            fill={item.color}
            fillOpacity={0.28}
            stroke={item.color}
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />,
          <AxisLabel
            key={`v-${item.label}`}
            x={start + BAR / 2}
            y={y(item.current) - 6}
            label={`${item.current}%`}
            strong
            color={item.alert ? colors.brand.DEFAULT : colors.foreground.DEFAULT}
          />,
          <AxisLabel
            key={`x-${item.label}`}
            x={start + BAR + 1}
            y={202}
            label={item.label}
            color={colors.foreground.muted}
          />,
        ];
      })}
    </ChartFrame>
  );
}
