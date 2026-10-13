import { colors } from '@guara/ui-tokens';
import { Rect } from 'react-native-svg';

import { AxisLabel, ChartFrame } from './ChartFrame';

export interface MonthBarsChartProps {
  /** One bar per month (whole reais or any unit `format` understands), oldest first. */
  data: readonly { label: string; value: number; color: string }[];
  format: (value: number) => string;
  /** Canvas height: 170 (cap of a category) or 150 (charges of a subscription). */
  height?: 150 | 170;
  accessibilityLabel: string;
}

const WIDTH = 340;

/** Simple month bars with the value above each one (caps, subscription charges). */
export function MonthBarsChart({
  data,
  format,
  height = 170,
  accessibilityLabel,
}: MonthBarsChartProps) {
  const bottom = height - 22;
  const plot = bottom - 32;
  const max = Math.max(1, ...data.map((bar) => bar.value));
  const slot = WIDTH / data.length;
  const bar = slot * 0.59;
  return (
    <ChartFrame width={WIDTH} height={height} accessibilityLabel={accessibilityLabel}>
      {data.map((item, index) => {
        const size = (item.value / max) * plot;
        const center = slot * index + slot / 2;
        return [
          <Rect
            key={`b-${item.label}`}
            x={center - bar / 2}
            y={bottom - size}
            width={bar}
            height={size}
            rx={5}
            fill={item.color}
          />,
          <AxisLabel
            key={`v-${item.label}`}
            x={center}
            y={bottom - size - 4}
            label={format(item.value)}
            strong
            size={10}
          />,
          <AxisLabel
            key={`x-${item.label}`}
            x={center}
            y={bottom + 16}
            label={item.label}
            size={10}
          />,
        ];
      })}
    </ChartFrame>
  );
}

/** Months of a category against its cap (detail of a cap): Arara-azul, Urucum above the cap. */
export function MonthCapChart({
  data,
  cap,
  format,
  accessibilityLabel,
}: {
  data: readonly { label: string; value: number }[];
  /** Cap of the category (same unit as the data). */
  cap: number;
  format: (value: number) => string;
  accessibilityLabel: string;
}) {
  return (
    <MonthBarsChart
      data={data.map((item) => ({
        ...item,
        color: item.value > cap ? colors.negative.DEFAULT : colors.info.DEFAULT,
      }))}
      format={format}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
