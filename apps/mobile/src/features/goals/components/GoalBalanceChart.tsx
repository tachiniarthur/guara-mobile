import type { Cents, YearMonth } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { formatDate } from '@guara/utils';
import { Rect, Text as SvgText } from 'react-native-svg';

import { CHART_FONT, ChartFrame } from '@/components/charts';

const WIDTH = 340;
const HEIGHT = 150;
const BASELINE = 128;
const BAR = 33.5;
const STEP = 54;
const LEFT = 18.3;
/** Room above the tallest bar for its label (the design leaves ~23%). */
const HEADROOM = 1.31;

/** "11,6 mil" */
function thousands(value: Cents): string {
  return `${(value / 100_000).toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} mil`;
}

export interface GoalBalanceChartProps {
  points: readonly { month: YearMonth; balance: Cents }[];
  accessibilityLabel: string;
}

/** End-of-month balance as bars with their value on top ("Como a reserva cresceu"). */
export function GoalBalanceChart({ points, accessibilityLabel }: GoalBalanceChartProps) {
  const max = Math.max(1, ...points.map((point) => point.balance)) * HEADROOM;
  return (
    <ChartFrame width={WIDTH} height={HEIGHT} accessibilityLabel={accessibilityLabel}>
      {points.map((point, index) => {
        const height = (point.balance / max) * BASELINE;
        const x = LEFT + index * STEP;
        return [
          <Rect
            key={`bar-${point.month}`}
            x={x}
            y={BASELINE - height}
            width={BAR}
            height={height}
            rx={5}
            fill={colors.positive.DEFAULT}
          />,
          <SvgText
            key={`value-${point.month}`}
            x={x + BAR / 2}
            y={BASELINE - height - 4}
            textAnchor="middle"
            fontSize={10}
            fontFamily={CHART_FONT.bold}
            fill={colors.foreground.DEFAULT}
          >
            {thousands(point.balance)}
          </SvgText>,
          <SvgText
            key={`month-${point.month}`}
            x={x + BAR / 2}
            y={144}
            textAnchor="middle"
            fontSize={10}
            fontFamily={CHART_FONT.regular}
            fill={colors.foreground.subtle}
          >
            {formatDate(`${point.month}-01`, 'MMM')}
          </SvgText>,
        ];
      })}
    </ChartFrame>
  );
}
