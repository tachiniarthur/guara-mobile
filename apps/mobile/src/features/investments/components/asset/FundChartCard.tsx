import { colors } from '@guara/ui-tokens';
import { EMPTY, formatPercent } from '@guara/utils';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { BenchmarkChart, LegendSwatch } from '@/components/charts';
import { toast } from '@/components/feedback';
import { SectionCard } from '@/components/layout';
import { Icon, InfoTip, Span, Text, UnderlineTabs } from '@/components/ui';

import { ADJUSTED_PRICE_INFO, type FundAsset } from '../../assets';
import {
  FUND_PERIODS,
  PERIOD_LABELS,
  PERIOD_X_LABELS,
  formatCdiShare,
  formatChartMoney,
  formatChartTick,
  formatPoints,
  seriesForPeriod,
  summarize,
  type FundPeriod,
} from '../../lib/chart-periods';

const PERIOD_OPTIONS = FUND_PERIODS.map((period) => ({
  value: period,
  label: period,
  accessibilityLabel: { '1M': '1 mês', YTD: 'No ano', '1A': '12 meses', '5A': '5 anos' }[period],
}));

function SelectButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="h-9 flex-row items-center gap-2 border-b border-border-strong px-1"
    >
      <Text size={14} weight="semibold" numberOfLines={1}>
        {label}
      </Text>
      <Icon name="chevronDown" size={14} color={colors.foreground.muted} />
    </Pressable>
  );
}

type Tone = 'positive' | 'negative' | 'muted';

/** Headline of a period cut from the 12-month series (the design only spells out 12 months). */
function headlineFor(asset: FundAsset, period: FundPeriod) {
  const { chart } = asset;
  if (period === '1A') return { value: chart.value, change: chart.change, label: chart.period };

  const series = seriesForPeriod(chart.series, period, chart.formatTick);
  const label = period === '5A' ? EMPTY : PERIOD_LABELS[period];
  if (!series) {
    return {
      value: chart.formatTick === 'money' ? chart.value : EMPTY,
      change: [{ text: 'Sem histórico de 5 anos', tone: 'muted' as Tone }],
      label,
    };
  }
  const summary = summarize(series, chart.formatTick);
  const excess = summary.assetReturn - summary.cdiReturn;
  const excessTone: Tone = excess < 0 ? 'negative' : 'positive';
  if (chart.formatTick === 'percent') {
    return {
      value: formatPercent(summary.assetReturn, { signDisplay: 'always', typographicMinus: true }),
      change: [
        { text: formatCdiShare(summary), tone: 'muted' as Tone },
        { text: formatPoints(excess), tone: excessTone },
      ],
      label,
    };
  }
  const up = summary.change >= 0;
  const percent = Math.abs(summary.assetReturn).toFixed(2).replace('.', ',');
  return {
    value: chart.value,
    change: [
      {
        text: `${formatChartMoney(Math.abs(summary.change))} ${up ? '▲' : '▼'} (${percent}%)`,
        tone: (up ? 'positive' : 'negative') as Tone,
      },
      { text: `${formatCdiShare(summary)} (${formatPoints(excess)})`, tone: 'muted' as Tone },
    ],
    label,
  };
}

/** Price (or return) against the CDI with period tabs, headline numbers and legend. */
export function FundChartCard({ asset, wide = false }: { asset: FundAsset; wide?: boolean }) {
  const [period, setPeriod] = useState<FundPeriod>('1A');
  const { chart } = asset;
  const series = seriesForPeriod(chart.series, period, chart.formatTick);
  const headline = headlineFor(asset, period);
  const xLabels =
    period === '1M' || period === 'YTD'
      ? PERIOD_X_LABELS[period][wide ? 'wide' : 'compact']
      : undefined;

  return (
    <SectionCard padding={wide ? 24 : 18} gap={16}>
      <View className="flex-row flex-wrap items-center justify-between gap-3">
        <UnderlineTabs
          options={PERIOD_OPTIONS}
          value={period}
          onChange={setPeriod}
          wide={wide}
          accessibilityLabel="Período"
          className="gap-1 border-b border-border"
        />
        <View className="flex-row flex-wrap items-center gap-4">
          <SelectButton
            label="Comparar com: CDI"
            onPress={() => toast.info('Por enquanto a comparação é só com o CDI.')}
          />
          {chart.adjustable ? (
            <View className="flex-row items-center">
              <SelectButton
                label="Preço ajustado"
                onPress={() => toast.info('O gráfico mostra o preço ajustado pelos rendimentos.')}
              />
              <InfoTip text={ADJUSTED_PRICE_INFO} />
            </View>
          ) : null}
        </View>
      </View>
      <View className="gap-1">
        <Text size={14} tone="muted">
          {chart.label}
        </Text>
        <Text
          serif
          weight="extrabold"
          size={wide ? 42 : 34}
          leading={1.05}
          tracking={-0.01}
          tabular
          tone={chart.valueTone === 'positive' && headline.value !== EMPTY ? 'positive' : 'default'}
        >
          {headline.value}
        </Text>
        <Text size={15} weight="bold" tabular>
          {headline.change.map((part, index) => (
            <Span key={part.text} tone={part.tone}>
              {index > 0 ? ' ' : ''}
              {part.text}
            </Span>
          ))}
        </Text>
        <Text size={12} weight="bold" tracking={0.06} tone="subtle">
          {headline.label}
        </Text>
      </View>
      {series ? (
        <BenchmarkChart
          key={period}
          asset={series.asset}
          benchmark={series.benchmark}
          ticks={series.ticks}
          tickYs={series.tickYs}
          formatTick={(value) => formatChartTick(value, chart.formatTick)}
          xLabels={xLabels}
          wide={wide}
          describePoint={(index) =>
            `${chart.legend}: ${formatChartTick(series.asset[index] ?? 0, chart.formatTick)} · CDI: ${formatChartTick(series.benchmark[index] ?? 0, chart.formatTick)}`
          }
          accessibilityLabel={`${chart.legend} ${period === '1A' ? 'em 12 meses' : `no período ${period}`} comparado ao CDI`}
        />
      ) : (
        <View
          className="items-center justify-center rounded-16 bg-surface-input px-6"
          style={{ aspectRatio: wide ? 720 / 320 : 357 / 240 }}
        >
          <Text size={14} tone="muted" align="center">
            Ainda não temos 5 anos de histórico deste ativo.
          </Text>
        </View>
      )}
      <View className="flex-row gap-4.5">
        <LegendSwatch label={chart.legend} color={colors.positive.DEFAULT} width={18} size={13} />
        <LegendSwatch label="CDI" dashed width={18} size={13} />
      </View>
    </SectionCard>
  );
}
