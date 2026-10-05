import { useState } from 'react';
import { View } from 'react-native';

import { QuoteChart } from '@/components/charts';
import { SectionCard } from '@/components/layout';
import { SegmentedControl, Text } from '@/components/ui';

import type { StockAsset } from '../../assets';
import {
  QUOTE_PERIODS,
  formatChartMoney,
  quoteScale,
  quotesForPeriod,
  type QuotePeriod,
} from '../../lib/chart-periods';

const DESCRIPTION: Record<QuotePeriod, string> = {
  '1D': 'Hoje',
  '1M': 'Último mês',
  '6M': 'Últimos 6 meses',
  '1A': 'Últimos 12 meses',
  '5A': 'Últimos 5 anos',
};

const OPTIONS = QUOTE_PERIODS.map((period) => ({
  value: period,
  label: period,
  accessibilityLabel: {
    '1D': '1 dia',
    '1M': '1 mês',
    '6M': '6 meses',
    '1A': '1 ano',
    '5A': '5 anos',
  }[period],
}));

/** 6 months of daily quotes: 21 trading days per month, from April to September. */
const SIX_MONTHS = ['abr', 'mai', 'jun', 'jul', 'ago', 'set'];
const LAST_MONTH = ['25/08', '01/09', '08/09', '15/09', '23/09'];

/** Stock price chart with the user's average price, highs and lows. */
export function QuoteCard({ asset, wide = false }: { asset: StockAsset; wide?: boolean }) {
  const [period, setPeriod] = useState<QuotePeriod>('6M');
  const values = quotesForPeriod(asset.quotes, period);
  const scale = values ? quoteScale(values) : null;
  const periods = (
    <SegmentedControl
      options={OPTIONS}
      value={period}
      onChange={setPeriod}
      size="xs"
      accessibilityLabel="Período do gráfico"
    />
  );

  return (
    <SectionCard
      title="Cotação"
      description={DESCRIPTION[period]}
      titleSize={20}
      padding={wide ? 20 : 18}
      gap={16}
      action={wide ? periods : undefined}
    >
      {wide ? null : periods}
      {values && scale ? (
        <QuoteChart
          key={period}
          values={values}
          minValue={scale.min}
          maxValue={scale.max}
          ticks={scale.ticks}
          averagePrice={{
            value: asset.averagePrice,
            label: `Seu preço médio ${formatChartMoney(asset.averagePrice)}`,
          }}
          format={formatChartMoney}
          xLabels={period === '6M' ? SIX_MONTHS : LAST_MONTH}
          describePoint={(index) => {
            const price = formatChartMoney(values[index] ?? 0);
            return period === '6M'
              ? `${SIX_MONTHS[Math.min(5, Math.floor(index / 21))]}: ${price}`
              : price;
          }}
          wide={wide}
          accessibilityLabel={`Cotação de ${asset.header.ticker}: ${DESCRIPTION[period].toLowerCase()}, de ${formatChartMoney(values[0] ?? 0)} a ${formatChartMoney(values[values.length - 1] ?? 0)} hoje. Mínima de ${formatChartMoney(Math.min(...values))} e máxima de ${formatChartMoney(Math.max(...values))}.`}
        />
      ) : (
        <View
          className="items-center justify-center rounded-16 bg-surface-input px-6"
          style={{ aspectRatio: wide ? 620 / 260 : 340 / 230 }}
        >
          <Text size={14} tone="muted" align="center">
            Ainda não temos a cotação deste período.
          </Text>
        </View>
      )}
    </SectionCard>
  );
}
