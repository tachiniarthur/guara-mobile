import { colors } from '@guara/ui-tokens';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { DonutChart, LegendSwatch, TargetBarChart } from '@/components/charts';
import { SectionCard } from '@/components/layout';
import { LinkButton, Span, Text } from '@/components/ui';
import type { AllocationClassKey } from '@/constants/target-allocations';
// Straight to the file: the investor-profile index imports Investimentos back.
import { compareAllocation } from '@/features/investor-profile/lib/profile';
import { conversationHref } from '@/navigation';

import { ASSET_CLASSES, PORTFOLIO } from '../data';
import { useProfileTargets } from '../hooks/useProfileTargets';

/** Gap under which the other classes count as close to the profile. */
const CLOSE_GAP = 5;

function Ring({
  title,
  caption,
  value,
  shares,
}: {
  title: string;
  caption: string;
  value: string;
  shares: Record<AllocationClassKey, number>;
}) {
  return (
    <View className="min-w-0 flex-1 items-center gap-2.5">
      <Text size={14} weight="bold">
        {title}
      </Text>
      <DonutChart
        size={128}
        strokeWidth={18}
        gap={2.5}
        trackColor={colors.surface.muted}
        segments={ASSET_CLASSES.map((item) => ({
          key: item.key,
          value: shares[item.key],
          color: item.color,
        }))}
      >
        <Text size={12} tone="subtle" leading={1.2}>
          {caption}
        </Text>
        <Text serif weight="bold" size={15} leading={1.2}>
          {value}
        </Text>
      </DonutChart>
    </View>
  );
}

/** Allocation against the investor profile: two rings, legend and class-by-class bars. */
export function AllocationCard() {
  const router = useRouter();
  const { label, targets } = useProfileTargets();
  const profile = label.toLowerCase();
  const current = Object.fromEntries(
    ASSET_CLASSES.map((item) => [item.key, item.current]),
  ) as Record<AllocationClassKey, number>;
  const comparison = compareAllocation(ASSET_CLASSES, targets);
  const others = comparison.rows.filter((row) => row.label !== comparison.biggest?.label);
  const restClose = others.every((row) => Math.abs(row.difference) <= CLOSE_GAP);
  return (
    <SectionCard
      title="Alocação"
      description={`Sua carteira comparada ao perfil ${profile}`}
      titleSize={18}
      padding={16}
      gap={16}
      className="flex-1"
    >
      <View
        accessible
        accessibilityLabel={`Sua carteira: ${ASSET_CLASSES.map((item) => `${item.label} ${item.current}%`).join(', ')}. Perfil ${profile}: ${ASSET_CLASSES.map((item) => `${item.label} ${targets[item.key]}%`).join(', ')}.`}
        className="flex-row gap-3"
      >
        <Ring
          title="Sua carteira"
          caption="Atual"
          value={`${PORTFOLIO.positionsCount} ativos`}
          shares={current}
        />
        <Ring title={`Perfil ${profile}`} caption="Alvo" value={label} shares={targets} />
      </View>
      <View className="flex-row flex-wrap justify-center gap-x-4 gap-y-1.5">
        {ASSET_CLASSES.map((item) => (
          <LegendSwatch key={item.key} label={item.label} color={item.color} shape="dot" />
        ))}
      </View>
      <View className="gap-2.5 border-t border-border pt-4">
        <Text size={14} weight="bold">
          Classe por classe
        </Text>
        <View className="flex-row flex-wrap gap-x-4 gap-y-1.5">
          <View className="flex-row items-center gap-1.5">
            <View className="h-3 w-3 rounded-[3px] bg-foreground-muted" />
            <Text size={12} tone="muted">
              Sua carteira
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="h-3 w-3 overflow-hidden rounded-[3px] border-[1.5px] border-foreground-muted">
              <View className="flex-1 bg-foreground-muted opacity-30" />
            </View>
            <Text size={12} tone="muted">
              Alvo do perfil {profile}
            </Text>
          </View>
        </View>
        <TargetBarChart
          data={ASSET_CLASSES.map((item) => ({
            label: item.short,
            color: item.color,
            current: item.current,
            target: targets[item.key],
            alert: Math.abs(item.current - targets[item.key]) >= CLOSE_GAP,
          }))}
          accessibilityLabel={`Comparação por classe, sua carteira contra o alvo do perfil ${profile}: ${ASSET_CLASSES.map((item) => `${item.label} ${item.current}% contra ${targets[item.key]}%`).join('; ')}.`}
        />
      </View>
      <View className="flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border pt-3">
        <Text variant="caption" tone="muted" className="min-w-0 flex-shrink">
          {comparison.biggest ? (
            <>
              <Span weight="bold" tone="brand">
                {comparison.biggest.label}
              </Span>{' '}
              está{' '}
              <Span weight="bold" tone="default">
                {`${comparison.biggest.points} p.p. ${comparison.biggest.direction}`}
              </Span>{' '}
              do alvo.{restClose ? ' O resto está perto do perfil.' : ''}
            </>
          ) : (
            'Sua carteira está no alvo do perfil.'
          )}
        </Text>
        <LinkButton
          label="Rebalancear com o Pacu"
          onPress={() => router.navigate(conversationHref())}
        />
      </View>
    </SectionCard>
  );
}
