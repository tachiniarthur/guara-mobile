import { colors } from '@guara/ui-tokens';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { DashedLine, ReturnChart } from '@/components/charts';
import { SectionCard } from '@/components/layout';
import { Button, Chip, Icon, MoneyText, Text } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';

import { useAllocation } from '../hooks/useAllocation';
import { PERFORMANCE, PORTFOLIO } from '../data';
import { useProperties } from '../hooks/useProperties';

const PERIODS = [
  { value: '6m', label: '6M', months: 6 },
  { value: '12m', label: '12M', months: 12 },
  { value: 'all', label: 'Tudo', months: 12 },
] as const;

/** Invested net worth, return against the CDI and the year's numbers. */
export function PortfolioCard() {
  const profile = useAllocation();
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { netWorth, total: propertiesTotal } = useProperties();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]['value']>('12m');
  const months = PERIODS.find((item) => item.value === period)?.months ?? 12;
  const from = PERFORMANCE.portfolio.length - months;
  const base = PERFORMANCE.portfolio[from] ?? 0;
  const baseCdi = PERFORMANCE.cdi[from] ?? 0;
  const portfolio = PERFORMANCE.portfolio.slice(from).map((value) => value - base);
  const cdi = PERFORMANCE.cdi.slice(from).map((value) => value - baseCdi);
  const pct = (value: number) =>
    `+${value.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%`;
  const lastPortfolio = portfolio[portfolio.length - 1] ?? 0;
  const lastCdi = cdi[cdi.length - 1] ?? 0;

  return (
    <SectionCard padding={isTablet ? 20 : 18} gap={isTablet ? 12 : 8} className="flex-1">
      <View className="flex-row items-center justify-between">
        <Text size={14} tone="muted">
          Patrimônio investido
        </Text>
        {isTablet ? null : (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`Perfil de investidor: ${profile.label}`}
            onPress={() => router.navigate('/account/investor-profile')}
            className="min-h-8 flex-row items-center gap-1"
          >
            <Icon name="shield" size={16} color={colors.foreground.DEFAULT} />
            <Text size={13}>{profile.label}</Text>
          </Pressable>
        )}
      </View>
      <MoneyText
        value={PORTFOLIO.total}
        serif
        weight="extrabold"
        size={34}
        leading={1.1}
        tracking={-0.01}
      />
      <Text size={14} weight="bold" tone="positive">
        {PORTFOLIO.monthGain}
      </Text>
      <View accessibilityLabel="Período do gráfico" className="mt-2 flex-row gap-1.5">
        {PERIODS.map((item) => (
          <Chip
            key={item.value}
            label={item.label}
            size={32}
            appearance="filled"
            selected={period === item.value}
            onPress={() => setPeriod(item.value)}
          />
        ))}
      </View>
      <View className="mt-2 flex-row items-center justify-between">
        <Text variant="caption" tone="subtle">
          Rentabilidade em {months} meses
        </Text>
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1.5">
            <View className="h-0.5 w-3.5 bg-positive" />
            <Text variant="caption" tone="subtle">
              Carteira
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <DashedLine width={14} color={colors.foreground.subtle} />
            <Text variant="caption" tone="subtle">
              CDI
            </Text>
          </View>
        </View>
      </View>
      <ReturnChart
        portfolio={portfolio}
        benchmark={cdi}
        labels={PERFORMANCE.months.slice(from)}
        portfolioLabel={`Carteira ${pct(lastPortfolio)}`}
        benchmarkLabel={`CDI ${pct(lastCdi)}`}
        accessibilityLabel={`Rentabilidade em ${months} meses: carteira ${pct(lastPortfolio)}, CDI ${pct(lastCdi)}`}
      />
      <View className="h-1" />
      <View>
        {PORTFOLIO.stats.map((stat) => (
          <View
            key={stat.label}
            className="flex-row items-baseline justify-between gap-3 border-t border-border py-2.5"
          >
            <View className="min-w-0 flex-1">
              <Text size={14} tone="muted" leading={1.35}>
                {stat.label}
              </Text>
              <Text size={12} tone="subtle" leading={1.35}>
                {stat.caption}
              </Text>
            </View>
            <Text size={16} weight="bold" tabular tone={stat.tone}>
              {stat.value}
            </Text>
          </View>
        ))}
      </View>
      <View className="gap-0.5 rounded-16 border border-border px-3.5 py-3">
        <Text size={13} tone="muted">
          Patrimônio total com bens
        </Text>
        <MoneyText value={netWorth} size={18} weight="bold" />
        <Text size={12} tone="subtle">
          investimentos + bens de{' '}
          <MoneyText value={propertiesTotal} wholeUnits size={12} tone="subtle" />
        </Text>
      </View>
      {isTablet ? null : (
        <Button
          size="md"
          fullWidth
          leftIcon="sprout"
          onPress={() => router.navigate('/investments/simulator')}
          className="mt-1"
        >
          Simular cenário
        </Button>
      )}
    </SectionCard>
  );
}
