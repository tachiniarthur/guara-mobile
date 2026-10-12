import type { Cents, NotificationChannel } from '@guara/types';
import { cents, EMPTY, formatCents, formatDate, formatPercent } from '@guara/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { PriceLineChart } from '@/components/charts';
import { toast } from '@/components/feedback';
import { FormScreen, ResponsiveGrid, SectionCard } from '@/components/layout';
import { Checkbox, Chip, Input, MoneyInput, Text } from '@/components/ui';
import { AssistantAvatar } from '@/features/chat';
import { useBreakpoint } from '@/hooks/useBreakpoint';

import { AlertKindOption } from '../components';
import { QUOTES, SHORTCUTS } from '../data';
import { distancePercent, formatPrice, niceTicks, tickLabel } from '../lib/price-alerts';
import { usePriceAlertsStore } from '../store';

const thousands = (value: number) =>
  `${(value / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`;
/** "R$ 650 mil" from R$ 1.000 up, otherwise the full price. */
const short = (reais: number) =>
  reais >= 1000 ? `R$ ${thousands(reais)}` : formatCents(Math.round(reais * 100));
/** Chart dates every week ("25 ago", "1 set"…, "hoje"). */
function weekLabels(start: string, count: number) {
  const labels = [];
  for (let index = 0; index < count - 1; index += 7) {
    const date = new Date(`${start}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + index);
    labels.push({ index, label: formatDate(date, 'd MMM').replace('.', '') });
  }
  return [...labels, { index: count - 1, label: 'hoje' }];
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'negative' | 'positive';
}) {
  return (
    <View className="min-w-0 flex-1 gap-1 rounded-16 bg-surface-input px-4 py-3.5">
      <Text size={12} tone="subtle">
        {label}
      </Text>
      <Text serif weight="bold" size={17} tone={tone} tabular>
        {value}
      </Text>
    </View>
  );
}

/**
 * Novo alerta de preço / Editar alerta: asset, buy/sell, trigger value, shortcuts and channels.
 * A triggered alert is renewed here with another target.
 */
export function NewPriceAlertScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const params = useLocalSearchParams<{ alertId?: string; ticker?: string }>();
  const editing = usePriceAlertsStore((state) =>
    state.alerts.find((alert) => alert.id === params.alertId),
  );
  const { add, update } = usePriceAlertsStore();
  const renewing = editing?.status === 'triggered';
  const quote = QUOTES[editing?.ticker ?? params.ticker ?? 'BTC'] ?? QUOTES.BTC!;
  const assetLabel = quote.name === quote.ticker ? quote.ticker : `${quote.name} (${quote.ticker})`;
  const quoteLabel = `Cotação às ${formatDate(quote.quotedAt, 'HH:mm')}`;

  const [asset, setAsset] = useState<string>(assetLabel);
  const [kind, setKind] = useState<'buy' | 'sell'>(editing?.side ?? 'sell');
  const [trigger, setTrigger] = useState<Cents | null>(
    renewing ? null : (editing?.targetPrice ?? cents(65_000_000)),
  );
  const [shortcut, setShortcut] = useState<number | null>(null);
  const [push, setPush] = useState(editing ? editing.channels.includes('push') : true);
  const [email, setEmail] = useState(editing ? editing.channels.includes('email') : true);
  const channels: NotificationChannel[] = [
    ...(push ? (['push'] as const) : []),
    ...(email ? (['email'] as const) : []),
  ];

  const distance = trigger ? distancePercent(quote.price, trigger) : null;
  const distanceLabel =
    distance === null
      ? undefined
      : `${formatPercent(Math.abs(distance), { fractionDigits: 1 })} ${distance >= 0 ? 'acima' : 'abaixo'} do preço atual`;
  const targetReais = trigger ? trigger / 100 : null;

  const applyShortcut = (percent: number) => {
    setShortcut(percent);
    const factor = kind === 'sell' ? 1 + percent / 100 : 1 - percent / 100;
    // Round to whole reais from R$ 1.000 up, to cents below.
    const step = quote.price >= 100_000 ? 100 : 1;
    setTrigger(cents(Math.round((quote.price * factor) / step) * step));
  };

  const save = () => {
    if (!trigger) return;
    if (editing) {
      update(editing.id, {
        side: kind,
        targetPrice: trigger,
        channels,
        ...(renewing
          ? { status: 'active' as const, triggeredAt: null, triggeredPrice: null }
          : null),
      });
      toast.success(renewing ? 'Alerta renovado' : 'Alerta atualizado');
    } else {
      add({
        ticker: quote.ticker,
        side: kind,
        targetPrice: trigger,
        status: 'active',
        channels,
        createdAt: new Date().toISOString(),
        triggeredAt: null,
        triggeredPrice: null,
      });
      toast.success('Alerta de preço criado');
    }
    if (router.canGoBack()) router.back();
    else router.replace('/alerts');
  };

  const history = quote.history;
  const low = history ? Math.min(...history.values) : null;
  const high = history ? Math.max(...history.values) : null;
  const ticks =
    history && low !== null && high !== null
      ? niceTicks(Math.min(low, targetReais ?? low), Math.max(high, targetReais ?? high))
      : [];

  const form = (
    <View className="gap-5.5">
      <Input
        label="Ativo"
        leftIcon="search"
        strong
        value={asset}
        onChangeText={setAsset}
        disabled={Boolean(editing)}
        helperText={`${quoteLabel}: ${formatPrice(quote.price)}`}
      />
      <View className="gap-2">
        <Text variant="label" className="mb-1">
          Tipo de alerta
        </Text>
        <ResponsiveGrid columns={{ phone: 1, tablet: 2 }} gap={10} stretch={false}>
          <AlertKindOption kind="buy" selected={kind === 'buy'} onPress={() => setKind('buy')} />
          <AlertKindOption kind="sell" selected={kind === 'sell'} onPress={() => setKind('sell')} />
        </ResponsiveGrid>
      </View>
      <MoneyInput
        label="Valor-gatilho"
        value={trigger}
        onChangeValue={(value) => {
          setShortcut(null);
          setTrigger(value);
        }}
        size={64}
        display
        rounded="16"
        helperText={distanceLabel}
      />
      <View accessibilityLabel="Atalhos de valor" className="-mt-3 flex-row gap-2">
        {SHORTCUTS.map((percent) => (
          <Chip
            key={percent}
            label={`${kind === 'sell' ? '+' : '−'}${percent}%`}
            size={36}
            appearance="filled"
            selected={shortcut === percent}
            onPress={() => applyShortcut(percent)}
          />
        ))}
      </View>
      <View>
        <Text variant="label" className="mb-1">
          Onde avisar
        </Text>
        <Checkbox checked={push} onChange={setPush} label="Notificação no celular" />
        <Checkbox checked={email} onChange={setEmail} label="E-mail" />
        {channels.length ? null : (
          <Text size={13} tone="negative" className="mt-1">
            Escolha pelo menos um jeito de receber o aviso.
          </Text>
        )}
      </View>
    </View>
  );

  const market = (
    <SectionCard padding={isTablet ? 20 : 16} gap={18}>
      <View className="flex-row flex-wrap items-baseline justify-between gap-3">
        <Text
          serif
          weight="bold"
          size={isTablet ? 18 : 17}
          leading={1.25}
          accessibilityRole="header"
        >
          {quote.name} nos últimos 30 dias
        </Text>
        <Text size={14} tone="muted">
          {quoteLabel}
        </Text>
      </View>
      {history && low !== null && high !== null ? (
        <PriceLineChart
          values={history.values}
          minValue={ticks[0]!}
          maxValue={ticks.at(-1)!}
          ticks={ticks.slice(0, -1).map((value) => ({ value, label: tickLabel(value) }))}
          xLabels={weekLabels(history.start, history.values.length)}
          target={
            targetReais
              ? {
                  value: targetReais,
                  label: `Alerta de ${kind === 'sell' ? 'venda' : 'compra'}: ${short(targetReais)}`,
                  axisLabel: targetReais >= 1000 ? thousands(targetReais) : short(targetReais),
                  tone: kind === 'sell' ? 'negative' : 'positive',
                }
              : undefined
          }
          minLabel={`mín. ${low >= 1000 ? thousands(low) : short(low)}`}
          describePoint={(index) => `R$ ${history.values[index]?.toLocaleString('pt-BR')}`}
          accessibilityLabel={`${quote.name} nos últimos 30 dias: mínima de ${short(low)}, máxima de ${short(high)}, agora ${formatPrice(quote.price)}.${distanceLabel ? ` Alerta em ${distanceLabel}.` : ''}`}
        />
      ) : (
        <Text size={14} tone="muted" leading={1.55}>
          {`Ainda não temos o histórico de 30 dias de ${quote.name}.`}
        </Text>
      )}
      <ResponsiveGrid columns={{ phone: 2, tablet: 4 }} gap={12}>
        <Stat label="Preço agora" value={formatPrice(quote.price)} />
        <Stat
          label="Máxima em 30 dias"
          value={high === null ? EMPTY : formatPrice(cents(high * 100))}
        />
        <Stat
          label="Mínima em 30 dias"
          value={low === null ? EMPTY : formatPrice(cents(low * 100))}
        />
        <Stat
          label="Falta para o alerta"
          value={
            distance === null
              ? '—'
              : formatPercent(distance, {
                  fractionDigits: 1,
                  signDisplay: 'always',
                  typographicMinus: true,
                })
          }
          tone={kind === 'sell' ? 'negative' : 'positive'}
        />
      </ResponsiveGrid>
      <View className="flex-row gap-3 rounded-20 bg-surface-muted p-4">
        <AssistantAvatar assistant="caramelo" size={32} />
        <Text size={14} leading={1.55} className="flex-1">
          Acompanhamos o preço a cada atualização e avisamos uma única vez quando o valor for
          atingido. Depois você decide se renova o alerta.
        </Text>
      </View>
    </SectionCard>
  );

  return (
    <FormScreen
      title={editing ? (renewing ? 'Renovar alerta' : 'Editar alerta') : 'Novo alerta de preço'}
      parents={[{ label: 'Alertas', href: '/alerts' }]}
      current={editing ? quote.name : 'Novo alerta de preço'}
      fallbackHref="/alerts"
      submit={{
        label: editing ? (renewing ? 'Renovar alerta' : 'Salvar alterações') : 'Criar alerta',
        onPress: save,
        disabled: !trigger || channels.length === 0,
      }}
    >
      {isTablet ? (
        <SectionCard padding={24} gap={16}>
          {form}
        </SectionCard>
      ) : (
        form
      )}
      {market}
    </FormScreen>
  );
}
