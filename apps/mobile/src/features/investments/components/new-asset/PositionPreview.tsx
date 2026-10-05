import type { Cents } from '@guara/types';
import { formatCents, formatPercent } from '@guara/utils';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { InfoNote, MoneyText, Span, Text } from '@/components/ui';

import { ClassShareBar } from './ClassShareBar';

export interface PositionPreviewProps {
  quantity: string;
  averagePrice: Cents | null;
  invested: Cents | null;
  worth: Cents | null;
  /** Portfolio before the purchase. */
  portfolio: Cents;
  /** Class the asset counts toward (`null`: no allocation effect to show). */
  allocation: {
    label: string;
    ticker: string;
    color: string;
    profile: string;
    current: number;
    after: number;
    target: number;
  } | null;
  wide?: boolean;
}

/** "Ações" → "ações" in the middle of a sentence; acronyms ("FIIs") stay. */
const inSentence = (label: string) =>
  label.length > 1 && label[1] === label[1]?.toLowerCase()
    ? label.charAt(0).toLowerCase() + label.slice(1)
    : label;

function Line({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      {typeof label === 'string' ? (
        <Text size={15} tone="muted">
          {label}
        </Text>
      ) : (
        label
      )}
      {children}
    </View>
  );
}

/** "Prévia da posição": invested, value today, result and the effect on the profile's allocation. */
export function PositionPreview({
  quantity,
  averagePrice,
  invested,
  worth,
  portfolio,
  allocation,
  wide = false,
}: PositionPreviewProps) {
  const result = invested !== null && worth !== null ? ((worth - invested) as Cents) : null;
  const resultPercent = result !== null && invested ? (result / invested) * 100 : null;
  const after = worth !== null ? ((portfolio + worth) as Cents) : null;
  const excess = allocation ? Math.round(allocation.after) - allocation.target : 0;
  const product =
    averagePrice !== null && quantity ? `${quantity} × ${formatCents(averagePrice)}` : null;

  return (
    <View className="min-w-0 gap-3 rounded-24 border border-border bg-surface p-5">
      <Text size={13} weight="bold" tone="muted" accessibilityRole="header">
        Prévia da posição
      </Text>
      <View className="gap-1.5">
        <Line
          label={
            <Text size={15} tone="muted">
              Investido
              {product && !wide ? <Span tone="subtle">{` (${product})`}</Span> : null}
            </Text>
          }
        >
          <Text size={15} weight="bold" tabular>
            {product && wide && invested !== null ? `${product} = ` : ''}
            <MoneyText value={invested} size={15} weight="bold" />
          </Text>
        </Line>
        <Line label="Vale hoje">
          <MoneyText value={worth} size={15} weight="bold" />
        </Line>
        <Line label="Resultado">
          <Text
            size={15}
            weight="bold"
            tabular
            tone={result === null ? 'subtle' : result >= 0 ? 'positive' : 'negative'}
          >
            {result === null
              ? '—'
              : `${formatCents(result, { signDisplay: 'always', typographicMinus: true })} (${formatPercent(resultPercent, { fractionDigits: 1, signDisplay: 'always', typographicMinus: true })})`}
          </Text>
        </Line>
      </View>
      <View className="h-px my-1 bg-border" />
      <Text size={13} weight="bold" tone="muted" accessibilityRole="header">
        Efeito na sua carteira
      </Text>
      <Line label={wide ? 'Patrimônio investido' : 'Patrimônio depois'}>
        <Text size={15} weight="bold" tabular numberOfLines={1}>
          {wide ? `${formatCents(portfolio)} → ` : ''}
          <MoneyText value={after} size={15} weight="bold" />
        </Text>
      </Line>
      {allocation ? (
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel={`${allocation.label} passam de ${Math.round(allocation.current)}% para ${Math.round(allocation.after)}% da carteira. Alvo do perfil ${allocation.profile}: ${allocation.target}%.`}
          className="gap-2.5"
        >
          <ClassShareBar
            label={`${allocation.label} hoje`}
            share={allocation.current}
            target={allocation.target}
            color={allocation.color}
          />
          <ClassShareBar
            label={`${allocation.label} com ${allocation.ticker}`}
            share={allocation.after}
            target={allocation.target}
            color={allocation.color}
          />
          <View className="flex-row items-center gap-1.5">
            <View className="h-3 w-0.5 bg-foreground" />
            <Text size={12} tone="subtle">
              Alvo do perfil {allocation.profile}: {allocation.target}%
            </Text>
          </View>
        </View>
      ) : null}
      {allocation && excess > 0 ? (
        <InfoNote icon="alertTriangle" tone="warning" size={13}>
          <Text size={13}>
            Com esta compra, {inSentence(allocation.label)} ficam{' '}
            <Span weight="bold">{excess} p.p. acima</Span> do alvo do seu perfil. Você pode salvar
            mesmo assim ou pedir ao Pacu uma sugestão de rebalanceamento.
          </Text>
        </InfoNote>
      ) : null}
    </View>
  );
}
