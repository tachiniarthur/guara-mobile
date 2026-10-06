import { colors } from '@guara/ui-tokens';
import { EMPTY, formatCents, formatPercent } from '@guara/utils';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { BenchmarkChart, LegendSwatch } from '@/components/charts';
import { SectionCard } from '@/components/layout';
import {
  Button,
  DataRow,
  Icon,
  InfoNote,
  InfoTip,
  RadioGroup,
  Sheet,
  Span,
  Text,
  UnderlineTabs,
} from '@/components/ui';
import { haptics } from '@/lib/haptics';

import { ADJUSTED_PRICE_INFO, type FundAsset } from '../../assets';
import { lastTwelveMonths } from '../../lib/events';
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

type Benchmark = 'cdi' | 'ibovespa' | 'ipca' | 'sp500' | 'none';

const BENCHMARKS: { value: Benchmark; label: string; description: string }[] = [
  { value: 'cdi', label: 'CDI', description: 'Renda fixa pós-fixada · padrão' },
  { value: 'ibovespa', label: 'Ibovespa', description: 'Principais ações da B3' },
  { value: 'ipca', label: 'IPCA', description: 'Inflação oficial' },
  { value: 'sp500', label: 'S&P 500', description: '500 maiores empresas dos EUA, em reais' },
  { value: 'none', label: 'Nenhum', description: 'Mostrar só o ativo' },
];

const percent = (value: number) =>
  formatPercent(value, { fractionDigits: 1, signDisplay: 'always', typographicMinus: true });

/** Difference of the two returns as shown (one place each): "−0,1 p.p.". */
function pointsText(asset: number, index: number): string {
  const difference = Math.round(asset * 10) / 10 - Math.round(index * 10) / 10;
  const text = formatPercent(difference, {
    fractionDigits: 1,
    signDisplay: 'always',
    typographicMinus: true,
  });
  return text.replace('%', ' p.p.');
}

/**
 * The index a fund replicates, from the fund itself: the fund plus its yearly fee, accrued
 * day by day ("O BOVA11 replica o Ibovespa…").
 */
function indexFromFund(asset: readonly number[], fee: number): number[] {
  return asset.map((value, index) => value * (1 + (fee / 100) * (index / (asset.length - 1))));
}

function NumberTile({
  label,
  value,
  caption,
  color,
}: {
  label: string;
  value: string;
  caption: string;
  color?: string;
}) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}, ${caption}`}
      className="min-w-0 flex-1 gap-1 rounded-16 bg-surface-input px-4 py-3.5"
    >
      <Text size={13} tone="subtle" numberOfLines={1}>
        {label}
      </Text>
      <Text serif weight="bold" size={16} style={color ? { color } : undefined} numberOfLines={1}>
        {value}
      </Text>
      <Text size={12} tone="muted" numberOfLines={1}>
        {caption}
      </Text>
    </View>
  );
}

/** "Preço ajustado" on/off (Tucano track when on). */
function AdjustedToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel="Preço ajustado"
      accessibilityState={{ checked: value }}
      hitSlop={10}
      onPress={() => {
        haptics.selection();
        onChange(!value);
      }}
      className="flex-row items-center gap-2"
    >
      <View
        className="h-6 w-10 justify-center rounded-full px-[3px]"
        style={{
          backgroundColor: value ? colors.brand.DEFAULT : colors.surface.muted,
          alignItems: value ? 'flex-end' : 'flex-start',
        }}
      >
        <View
          className="h-[18px] w-[18px] rounded-full"
          style={{ backgroundColor: value ? colors.background.DEFAULT : colors.foreground.muted }}
        />
      </View>
      <Text size={14} weight="semibold" tone="muted">
        Preço ajustado
      </Text>
    </Pressable>
  );
}

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
  const [benchmark, setBenchmark] = useState<Benchmark>('cdi');
  const [choosing, setChoosing] = useState<Benchmark | null>(null);
  const [adjusted, setAdjusted] = useState(true);
  const { chart, comparison, unadjusted } = asset;
  const indexSeries =
    benchmark === 'ibovespa' && comparison
      ? { ...chart.series, benchmark: indexFromFund(chart.series.asset, comparison.fee) }
      : chart.series;
  const series = seriesForPeriod(indexSeries, period, chart.formatTick);
  const headline = headlineFor(asset, period);
  const benchmarkLabel = BENCHMARKS.find((item) => item.value === benchmark)!.label;
  const indexMode = benchmark === 'ibovespa' && comparison !== undefined;
  const summary = series ? summarize(series, chart.formatTick) : null;
  // The CDI comparison of the headline only makes sense with the CDI on the chart.
  const change = benchmark === 'cdi' ? headline.change : headline.change.slice(0, 1);
  const available = (value: Benchmark) =>
    value === 'cdi' || value === 'none' || (value === 'ibovespa' && comparison !== undefined);
  const income =
    unadjusted && asset.events.kind === 'list'
      ? lastTwelveMonths(asset.events.items, unadjusted.end)
      : null;
  const priceReturn = unadjusted
    ? ((unadjusted.end - unadjusted.start) / unadjusted.start) * 100
    : 0;
  const xLabels =
    period === '1M' || period === 'YTD'
      ? PERIOD_X_LABELS[period][wide ? 'wide' : 'compact']
      : undefined;

  return (
    <>
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
              label={`Comparar com: ${benchmarkLabel}`}
              onPress={() => setChoosing(benchmark)}
            />
            {chart.adjustable && unadjusted ? (
              <AdjustedToggle value={adjusted} onChange={setAdjusted} />
            ) : chart.adjustable ? (
              <View className="flex-row items-center">
                <Text size={14} weight="semibold">
                  Preço ajustado
                </Text>
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
            tone={
              chart.valueTone === 'positive' && headline.value !== EMPTY ? 'positive' : 'default'
            }
          >
            {headline.value}
          </Text>
          <Text size={15} weight="bold" tabular>
            {change.map((part, index) => (
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
            benchmarkColor={indexMode ? colors.info.DEFAULT : colors.foreground.subtle}
            hideBenchmark={benchmark === 'none'}
            describePoint={(index) =>
              benchmark === 'none'
                ? `${chart.legend}: ${formatChartTick(series.asset[index] ?? 0, chart.formatTick)}`
                : `${chart.legend}: ${formatChartTick(series.asset[index] ?? 0, chart.formatTick)} · ${benchmarkLabel}: ${formatChartTick(series.benchmark[index] ?? 0, chart.formatTick)}`
            }
            accessibilityLabel={`${chart.legend} ${period === '1A' ? 'em 12 meses' : `no período ${period}`}${benchmark === 'none' ? '' : ` comparado com ${benchmarkLabel}`}`}
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
          {benchmark === 'none' ? null : (
            <LegendSwatch
              label={benchmarkLabel}
              dashed
              color={indexMode ? colors.info.DEFAULT : undefined}
              width={18}
              size={13}
            />
          )}
        </View>
        {indexMode && summary && comparison ? (
          <>
            <View className="flex-row gap-2">
              <NumberTile
                label={chart.legend}
                value={percent(summary.assetReturn)}
                caption={period === '1A' ? '12 meses' : period}
                color={summary.assetReturn >= 0 ? colors.positive.DEFAULT : colors.negative.DEFAULT}
              />
              <NumberTile
                label={comparison.label}
                value={percent(summary.cdiReturn)}
                caption={period === '1A' ? '12 meses' : period}
                color={colors.info.DEFAULT}
              />
              <NumberTile
                label="Diferença"
                value={pointsText(summary.assetReturn, summary.cdiReturn)}
                caption={comparison.differenceCaption}
              />
            </View>
            <Text size={13} leading={1.55} tone="subtle">
              {comparison.note}
            </Text>
          </>
        ) : null}
        {unadjusted && !adjusted ? (
          <>
            <View className="flex-row gap-2">
              <NumberTile label="Só a cota" value={percent(priceReturn)} caption="12 meses" />
              <NumberTile
                label="Rendimentos pagos"
                value={income ? formatCents(income.perUnit) : EMPTY}
                caption="por cota"
              />
              <NumberTile
                label="Com rendimentos"
                value={percent(unadjusted.adjustedReturn)}
                caption="se ligar o ajuste"
                color={colors.positive.DEFAULT}
              />
            </View>
            <InfoNote icon="info" size={13} className="rounded-14 px-3.5 py-3">
              <Text size={13} leading={1.5}>
                <Span weight="bold">Preço ajustado desligado.</Span>
                {` O gráfico mostra a cota como foi negociada em cada dia. Os rendimentos mensais (${formatCents(unadjusted.monthlyIncome)} por cota) não entram, por isso a alta parece menor.`}
              </Text>
            </InfoNote>
          </>
        ) : null}
        <Sheet open={choosing !== null} onClose={() => setChoosing(null)} title="Comparar com">
          <RadioGroup
            accessibilityLabel="Comparar com"
            value={choosing}
            onChange={setChoosing}
            options={BENCHMARKS.map((item) => ({
              value: item.value,
              label: item.label,
              description: available(item.value)
                ? item.description
                : `${item.description} · sem série para este ativo`,
              disabled: !available(item.value),
            }))}
          />
          <Button
            fullWidth
            size="lg"
            onPress={() => {
              if (choosing) setBenchmark(choosing);
              setChoosing(null);
            }}
          >
            Aplicar
          </Button>
        </Sheet>
      </SectionCard>
      {unadjusted && !adjusted ? <AdjustmentCard asset={asset} /> : null}
    </>
  );
}

/** "Com e sem ajuste": the quote as traded, the income and the total return. */
export function AdjustmentCard({ asset }: { asset: FundAsset }) {
  const { unadjusted } = asset;
  if (!unadjusted) return null;
  const income =
    asset.events.kind === 'list' ? lastTwelveMonths(asset.events.items, unadjusted.end) : null;
  const priceReturn = ((unadjusted.end - unadjusted.start) / unadjusted.start) * 100;
  return (
    <SectionCard title="Com e sem ajuste" titleSize={17} padding={18} gap={4}>
      <View>
        <DataRow label={`Cota em ${unadjusted.startDate}`} value={formatCents(unadjusted.start)} />
        <DataRow
          label="Cota hoje"
          value={`${formatCents(unadjusted.end)} · ${percent(priceReturn)}`}
        />
        <DataRow
          label="Rendimentos no período"
          value={income ? `${formatCents(income.perUnit)} por cota` : EMPTY}
        />
        <DataRow
          label="Retorno total"
          value={`${percent(unadjusted.adjustedReturn)}, igual ao gráfico ajustado`}
        />
      </View>
    </SectionCard>
  );
}
