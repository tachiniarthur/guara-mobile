import { colors } from '@guara/ui-tokens';
import { Rect } from 'react-native-svg';

import { AxisLabel, ChartFrame } from './ChartFrame';

export interface MonthCapChartProps {
  /** Monthly totals (whole reais); the last one is the current month. */
  data: readonly { label: string; value: number }[];
  /** Cap of the category (whole reais); bars above it are drawn in Urucum. */
  cap: number;
  format: (value: number) => string;
  accessibilityLabel: string;
}

const WIDTH = 340;
const BOTTOM = 148;
/** Height of the tallest bar. */
const PLOT = 115;
const BAR = 33.5;

/** Months of a category against its cap (detail of a cap): Arara-azul, Urucum above the cap. */
export function MonthCapChart({ data, cap, format, accessibilityLabel }: MonthCapChartProps) {
  const max = Math.max(1, ...data.map((bar) => bar.value));
  const slot = WIDTH / data.length;
  return (
    <ChartFrame width={WIDTH} height={170} accessibilityLabel={accessibilityLabel}>
      {data.map((bar, index) => {
        const height = (bar.value / max) * PLOT;
        const center = slot * index + slot / 2;
        return [
          <Rect
            key={`b-${bar.label}`}
            x={center - BAR / 2}
            y={BOTTOM - height}
            width={BAR}
            height={height}
            rx={5}
            fill={bar.value > cap ? colors.negative.DEFAULT : colors.info.DEFAULT}
          />,
          <AxisLabel
            key={`v-${bar.label}`}
            x={center}
            y={BOTTOM - height - 4}
            label={format(bar.value)}
            strong
            size={10}
          />,
          <AxisLabel key={`x-${bar.label}`} x={center} y={164} label={bar.label} size={10} />,
        ];
      })}
    </ChartFrame>
  );
}
