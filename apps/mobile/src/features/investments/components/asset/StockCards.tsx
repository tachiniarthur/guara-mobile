import { colors } from '@guara/ui-tokens';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { BarChart, RangeBar } from '@/components/charts';
import { SectionCard } from '@/components/layout';
import { DataRow, EmptyValue, Text } from '@/components/ui';

import type { InfoRow, StockAsset } from '../../assets';
import { formatChartMoney } from '../../lib/chart-periods';

interface RowsCardProps {
  title: string;
  description?: string;
  rows: readonly InfoRow[];
  wide?: boolean;
  /** Content above the rows (range bar). */
  header?: ReactNode;
  /** Content below the rows (about the company). */
  children?: ReactNode;
}

/** Card with a definition list of the stock page ("Indicadores", "Sobre a empresa"). */
export function RowsCard({
  title,
  description,
  rows,
  wide = false,
  header,
  children,
}: RowsCardProps) {
  return (
    <SectionCard
      title={title}
      description={description}
      padding={wide ? 20 : 18}
      gap={16}
      className="flex-1"
    >
      {header}
      <View>
        {rows.map((row) => (
          <DataRow key={row.label} label={row.label} value={row.value} density="compact" />
        ))}
      </View>
      {children}
    </SectionCard>
  );
}

/** "Hoje" and "52 semanas": where the price sits between the low and the high. */
export function RangeCard({
  title,
  description,
  range,
  current,
  wide,
}: {
  title: string;
  description: string;
  range: StockAsset['today'] | StockAsset['year'];
  current: string;
  wide?: boolean;
}) {
  const min = range.min.replace('Mín. ', '');
  const max = range.max.replace('Máx. ', '');
  return (
    <RowsCard
      title={title}
      description={description}
      rows={range.rows}
      wide={wide}
      header={
        <RangeBar
          position={range.position}
          minLabel={range.min}
          maxLabel={range.max}
          accessibilityLabel={`Faixa ${title === 'Hoje' ? 'do dia' : 'de 52 semanas'}: mínima ${min}, máxima ${max}, agora ${current}`}
        />
      }
    />
  );
}

const PHONE_CHART = {
  geometry: { width: 340, height: 200, right: 332, top: 54.5, bottom: 176, labelY: 192 },
  barWidth: 22.4,
};
const TABLET_CHART = {
  geometry: { width: 620, height: 210, right: 612, top: 56.8, bottom: 186, labelY: 202 },
  barWidth: 34,
};

/** "Proventos": dividends per share over 2 years and the last payments. */
export function DividendsCard({ asset, wide = false }: { asset: StockAsset; wide?: boolean }) {
  const { dividends } = asset;
  const last = dividends.bars.length - 1;
  const chart = wide ? TABLET_CHART : PHONE_CHART;
  const lastBar = dividends.bars[last];

  return (
    <SectionCard
      title="Proventos"
      description={dividends.caption}
      padding={wide ? 20 : 18}
      gap={16}
    >
      <BarChart
        data={dividends.bars.map((bar, index) => ({
          // Phones label every other payment.
          label: wide || index % 2 === 1 ? bar.month : '',
          value: bar.value,
          highlight: index === last,
          valueLabel: index === last ? formatChartMoney(bar.value) : undefined,
          description: `${bar.month}: ${formatChartMoney(bar.value)} por ação`,
        }))}
        maxValue={1}
        ticks={[0, 0.5, 1].map((value) => ({ value, label: value.toFixed(2).replace('.', ',') }))}
        color={colors.positive.DEFAULT}
        dimOpacity={0.5}
        left={44}
        barWidth={chart.barWidth}
        geometry={chart.geometry}
        accessibilityLabel={`Proventos por ação nos últimos ${dividends.bars.length} pagamentos, de ${formatChartMoney(Math.min(...dividends.bars.map((bar) => bar.value)))} a ${formatChartMoney(Math.max(...dividends.bars.map((bar) => bar.value)))}. Último: ${lastBar ? formatChartMoney(lastBar.value) : ''} em ${lastBar?.month ?? ''}.`}
      />
      <View>
        {dividends.items.map((item) => (
          <View
            key={item.title + item.paidOn}
            className="min-h-[52px] flex-row items-center justify-between gap-3 border-b border-border"
          >
            <View className="min-w-0 flex-1">
              <Text size={14} weight="bold" leading={1.35}>
                {item.title}
              </Text>
              <Text size={12} tone="subtle" leading={1.35}>
                {item.paidOn}
              </Text>
            </View>
            <View className="items-end">
              {item.amount ? (
                <Text size={14} weight="bold" tone="positive" tabular leading={1.35}>
                  {item.amount}
                </Text>
              ) : (
                <EmptyValue size={14} weight="bold" leading={1.35} />
              )}
              <Text size={12} tone="subtle" leading={1.35}>
                {item.note}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </SectionCard>
  );
}
