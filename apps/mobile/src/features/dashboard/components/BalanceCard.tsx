import { colors } from '@guara/ui-tokens';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { StateMessage, StateSlot, useScreenState } from '@/components/feedback';

import { CashflowChart, LegendSwatch } from '@/components/charts';
import { Contours, MataButton } from '@/components/illustrations';
import { CardHeader } from '@/components/layout';
import {
  Card,
  HideValuesButton,
  Icon,
  MoneyText,
  SegmentedControl,
  Text,
  useSkeleton,
  maskMoneyIn,
} from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';
import { useUiPreferences } from '@/stores';

import { CASHFLOW, HOME } from '../data';

type ChartPeriod = 'month' | 'year';

interface FlowRowProps {
  label: string;
  value: typeof HOME.balance.inflow;
  delta: string;
  marker: 'in' | 'out' | 'left';
  masked: boolean;
}

function FlowRow({ label, value, delta, marker, masked }: FlowRowProps) {
  const loading = useSkeleton();
  return (
    <View className="min-h-10 flex-row items-center gap-2.5">
      <View className="w-7">
        {loading ? null : marker === 'left' ? (
          <View className="ml-[7px] h-3.5 w-3.5 rounded-full border-[3px] border-foreground" />
        ) : (
          <View className="ml-[3px]">
            <Icon
              name={marker === 'in' ? 'arrowDownLeft' : 'arrowUpRight'}
              size={22}
              strokeWidth={2.2}
              color={marker === 'in' ? colors.chart.in : colors.chart.out}
            />
          </View>
        )}
      </View>
      <Text size={15} weight="semibold" leading={1.25} className="flex-1">
        {label}
      </Text>
      <View className="items-end">
        <MoneyText value={value} masked={masked} size={17} weight="bold" leading={1.25} />
        <Text size={12} weight="bold" tone="positive" leading={1.25}>
          {masked ? maskMoneyIn(delta) : delta}
        </Text>
      </View>
    </View>
  );
}

/** "Resumo do mês": consolidated balance over contour lines + cashflow chart. */
export function BalanceCard() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const masked = useUiPreferences((state) => state.hideBalances);
  const [period, setPeriod] = useState<ChartPeriod>('month');
  const { status } = useScreenState();
  const { balance } = HOME;
  // Error and empty keep only the card title over the message (design: Início · estados).
  const replaced = status === 'error' || status === 'empty';

  return (
    <Card
      padding="none"
      className={cn('gap-4.5', isTablet ? 'rounded-28 p-6' : 'rounded-24 p-4.5')}
    >
      {status === 'ready' ? <Contours /> : null}
      {replaced ? <CardHeader title="Entradas e saídas" size={isTablet ? 22 : 19} /> : null}
      <StateSlot
        empty={
          <StateMessage
            icon="bank"
            title="Nenhum banco conectado"
            description="Conecte um banco pela Malvo para ver saldo, entradas e saídas do mês. O Guará só lê os dados."
            action={
              <MataButton
                label="Conectar banco"
                size={44}
                onPress={() => router.navigate('/connect-bank')}
              />
            }
          />
        }
      >
        <View className="gap-5">
          <View className="gap-3.5">
            <View className="flex-row items-start justify-between gap-2">
              <View className="gap-1">
                <Text size={14} tone="muted">
                  {balance.label}
                </Text>
                <MoneyText value={balance.value} masked={masked} variant="hero" numberOfLines={1} />
              </View>
              <HideValuesButton />
            </View>
            <View className="gap-1">
              <FlowRow
                label="Entradas"
                value={balance.inflow}
                delta={balance.inflowDelta}
                marker="in"
                masked={masked}
              />
              <FlowRow
                label="Saídas"
                value={balance.outflow}
                delta={balance.outflowDelta}
                marker="out"
                masked={masked}
              />
              <FlowRow
                label="Sobrou no mês"
                value={balance.left}
                delta={balance.leftDelta}
                marker="left"
                masked={masked}
              />
            </View>
          </View>
          <View className="gap-2 border-t border-border pt-4.5">
            <CardHeader
              title="Entradas e saídas"
              size={isTablet ? 22 : 19}
              aside={
                <SegmentedControl
                  size="sm"
                  accessibilityLabel="Período do gráfico"
                  value={period}
                  onChange={setPeriod}
                  options={[
                    { value: 'month', label: 'Mês' },
                    { value: 'year', label: 'Ano' },
                  ]}
                />
              }
            />
            <CashflowChart
              variant={isTablet ? 'wide' : 'compact'}
              inflow={CASHFLOW.inflow}
              outflow={CASHFLOW.outflow}
              outflowForecast={CASHFLOW.outflowForecast}
              daysInMonth={CASHFLOW.daysInMonth}
              maxValue={CASHFLOW.maxValue}
              masked={masked}
              accessibilityLabel={
                masked ? maskMoneyIn(CASHFLOW.accessibilityLabel) : CASHFLOW.accessibilityLabel
              }
            />
            {isTablet ? null : (
              <View className="flex-row flex-wrap gap-x-3.5 gap-y-1.5">
                <LegendSwatch label="Entradas" color={colors.chart.in} />
                <LegendSwatch label="Saídas" color={colors.chart.out} />
                <LegendSwatch label="Previsão até dia 30" dashed />
              </View>
            )}
          </View>
        </View>
      </StateSlot>
    </Card>
  );
}
