import type { Cents } from '@guara/types';
import { cents, formatCents, formatPercent } from '@guara/utils';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { PriceLineChart } from '@/components/charts';
import { toast } from '@/components/feedback';
import { FormScreen, ResponsiveGrid, SectionCard } from '@/components/layout';
import { Checkbox, Chip, Input, MoneyInput, Text } from '@/components/ui';
import { AssistantAvatar } from '@/features/chat';
import { useBreakpoint } from '@/hooks/useBreakpoint';

import { AlertKindOption } from '../components';
import { ALERT_ASSET, SHORTCUTS } from '../data';

const reais = (value: Cents) => formatCents(value, { wholeUnits: true });
const thousands = (value: number) =>
  `${(value / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`;

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

/** Novo alerta de preço: asset, buy/sell, trigger value, shortcuts and channels. */
export function NewPriceAlertScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const [asset, setAsset] = useState<string>(ALERT_ASSET.name);
  const [kind, setKind] = useState<'buy' | 'sell'>('sell');
  const [trigger, setTrigger] = useState<Cents | null>(cents(65_000_000));
  const [shortcut, setShortcut] = useState<number | null>(null);
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);

  const distance = trigger ? ((trigger - ALERT_ASSET.price) / ALERT_ASSET.price) * 100 : null;
  const distanceLabel =
    distance === null
      ? undefined
      : `${formatPercent(Math.abs(distance), { fractionDigits: 1 })} ${distance >= 0 ? 'acima' : 'abaixo'} do preço atual`;
  const targetReais = trigger ? trigger / 100 : null;

  const applyShortcut = (percent: number) => {
    setShortcut(percent);
    const factor = kind === 'sell' ? 1 + percent / 100 : 1 - percent / 100;
    setTrigger(cents(Math.round((ALERT_ASSET.price * factor) / 100) * 100));
  };

  const save = () => {
    toast.success('Alerta de preço criado');
    if (router.canGoBack()) router.back();
    else router.replace('/alerts');
  };

  const form = (
    <View className="gap-5.5">
      <Input
        label="Ativo"
        leftIcon="search"
        strong
        value={asset}
        onChangeText={setAsset}
        helperText={`${ALERT_ASSET.quoteLabel}: ${reais(ALERT_ASSET.price)}`}
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
          {ALERT_ASSET.shortName} nos últimos 30 dias
        </Text>
        <Text size={14} tone="muted">
          {ALERT_ASSET.quoteLabel}
        </Text>
      </View>
      <PriceLineChart
        values={ALERT_ASSET.history}
        minValue={550000}
        maxValue={650000}
        ticks={[
          { value: 550000, label: '550 mil' },
          { value: 600000, label: '600 mil' },
        ]}
        xLabels={ALERT_ASSET.xLabels}
        target={
          targetReais
            ? {
                value: targetReais,
                label: `Alerta de ${kind === 'sell' ? 'venda' : 'compra'}: R$ ${thousands(targetReais)}`,
                axisLabel: thousands(targetReais),
                tone: kind === 'sell' ? 'negative' : 'positive',
              }
            : undefined
        }
        minLabel={`mín. ${thousands(Math.min(...ALERT_ASSET.history))}`}
        describePoint={(index) => `R$ ${ALERT_ASSET.history[index]?.toLocaleString('pt-BR')}`}
        accessibilityLabel={`Bitcoin nos últimos 30 dias: mínima de R$ 553,6 mil, máxima de R$ 624,2 mil, agora R$ 615,2 mil.${distanceLabel ? ` Alerta em ${distanceLabel}.` : ''}`}
      />
      <ResponsiveGrid columns={{ phone: 2, tablet: 4 }} gap={12}>
        <Stat label="Preço agora" value={reais(ALERT_ASSET.price)} />
        <Stat label="Máxima em 30 dias" value={reais(ALERT_ASSET.high)} />
        <Stat label="Mínima em 30 dias" value={reais(ALERT_ASSET.low)} />
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
      title="Novo alerta de preço"
      parents={[{ label: 'Alertas', href: '/alerts' }]}
      current="Novo alerta de preço"
      fallbackHref="/alerts"
      submit={{ label: 'Criar alerta', onPress: save, disabled: !trigger }}
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
