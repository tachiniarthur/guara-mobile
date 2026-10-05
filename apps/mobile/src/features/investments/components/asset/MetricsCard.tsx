import { EMPTY, formatPercent, MINUS_SIGN } from '@guara/utils';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { SectionCard } from '@/components/layout';
import { Chip, DataRow, DataTable, InfoTip, Text, type TextTone } from '@/components/ui';

import {
  CDI_RETURNS,
  METRIC_PERIODS,
  METRICS_UPDATED,
  type AssetMetrics,
  type MetricPeriod,
  type PeriodValues,
} from '../../assets';

interface MetricLine {
  label: string;
  info: string;
  values: PeriodValues;
  format: (value: number) => string;
  /** Green when positive, red when negative. */
  signed: boolean;
}

const signedPercent = (value: number) =>
  formatPercent(value, { fractionDigits: 1, signDisplay: 'always', typographicMinus: true });
const ratio = (value: number) =>
  `${value < 0 ? MINUS_SIGN : ''}${Math.abs(value).toFixed(2).replace('.', ',')}`;

const linesOf = (metrics: AssetMetrics): MetricLine[] => [
  {
    label: 'Rentabilidade',
    info: 'Quanto o ativo rendeu no período.',
    values: metrics.returns,
    format: signedPercent,
    signed: true,
  },
  {
    label: 'CDI',
    info: 'Referência da renda fixa no mesmo período.',
    values: CDI_RETURNS,
    format: signedPercent,
    signed: false,
  },
  {
    label: 'Excesso (p.p.)',
    info: 'Diferença entre a rentabilidade do ativo e o CDI.',
    values: metrics.excess,
    format: signedPercent,
    signed: true,
  },
  {
    label: 'Volatilidade anualizada',
    info: 'Quanto o preço oscila. Quanto maior, mais arriscado.',
    values: metrics.volatility,
    format: (value) => formatPercent(value, { fractionDigits: 1 }),
    signed: false,
  },
  {
    label: 'Sharpe',
    info: 'Retorno acima do CDI para cada unidade de risco. Acima de 0 é melhor que o CDI.',
    values: metrics.sharpe,
    format: ratio,
    signed: false,
  },
];

function cellOf(line: MetricLine, index: number): { text: string; tone: TextTone } {
  const value = line.values[index];
  if (value === null || value === undefined) return { text: EMPTY, tone: 'subtle' };
  const tone: TextTone =
    line.signed && value > 0 ? 'positive' : line.signed && value < 0 ? 'negative' : 'default';
  return { text: line.format(value), tone };
}

/** Return, CDI, excess, volatility and Sharpe: period chips on phones, the full table on tablets. */
export function MetricsCard({ metrics, wide = false }: { metrics: AssetMetrics; wide?: boolean }) {
  const [period, setPeriod] = useState<MetricPeriod>('12M');
  const lines = linesOf(metrics);
  const index = METRIC_PERIODS.indexOf(period);

  return (
    <SectionCard
      title="Indicadores principais"
      description={METRICS_UPDATED}
      descriptionTone="muted"
      titleSize={wide ? 20 : 18}
      padding={wide ? 20 : 16}
      gap={14}
    >
      {wide ? (
        <DataTable
          caption="Indicadores principais por período"
          cellPadding={10}
          minWidth={760}
          columns={[
            { key: 'metric', label: 'Indicador', hideLabel: true, flex: 2.2 },
            ...METRIC_PERIODS.map((label) => ({
              key: label,
              label,
              align: 'right' as const,
              flex: label === 'Desde o início' ? 1.6 : 1,
            })),
          ]}
          rows={lines.map((line) => ({
            key: line.label,
            cells: [
              <View key="label" className="flex-row items-center">
                <Text size={13} weight="medium" tone="soft" numberOfLines={1}>
                  {line.label}
                </Text>
                <InfoTip text={line.info} size={14} />
              </View>,
              ...METRIC_PERIODS.map((label, column) => {
                const cell = cellOf(line, column);
                return (
                  <Text
                    key={label}
                    size={13}
                    weight="bold"
                    tone={cell.tone}
                    tabular
                    numberOfLines={1}
                  >
                    {cell.text}
                  </Text>
                );
              }),
            ],
          }))}
        />
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            accessibilityLabel="Período"
            style={{ marginRight: -16 }}
            contentContainerStyle={{ gap: 6, paddingRight: 16 }}
          >
            {METRIC_PERIODS.map((label) => (
              <Chip
                key={label}
                label={label}
                size={34}
                selected={label === period}
                onPress={() => setPeriod(label)}
              />
            ))}
          </ScrollView>
          <View style={{ marginTop: -4 }}>
            {lines.map((line, row) => {
              const cell = cellOf(line, index);
              return (
                <DataRow
                  key={line.label}
                  label={line.label}
                  labelInfo={line.info}
                  labelTone="soft"
                  value={cell.text}
                  tone={cell.tone}
                  valueSize={16}
                  density="relaxed"
                  last={row === lines.length - 1}
                />
              );
            })}
          </View>
        </>
      )}
      <Text size={13} tone="subtle">
        {metrics.note}
      </Text>
    </SectionCard>
  );
}
