import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { SectionCard } from '@/components/layout';
import { LinkButton, Span, Text } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { conversationHref } from '@/navigation';

import { useAllocation } from '../hooks/useAllocation';
import { barScale, directionText, shareText } from '../lib/allocation';

import { AllocationRings, GroupTargetList } from './allocation';

/** Allocation against the investor profile: two rings, legend and the 5 groups. */
export function AllocationCard() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { label, groups, out, biggest, positionsCount } = useAllocation();
  const scale = barScale(groups.flatMap((group) => [group.current, group.target]));

  return (
    <SectionCard
      title="Alocação"
      description={`Sua carteira comparada ao perfil ${label}, em 5 grupos`}
      titleSize={18}
      padding={isTablet ? 20 : 16}
      gap={16}
      className="flex-1"
    >
      <AllocationRings groups={groups} profileLabel={label} positionsCount={positionsCount} />
      <View className="gap-1.5 border-t border-border pt-3.5">
        <View className="flex-row items-baseline justify-between gap-2">
          <Text size={14} weight="bold">
            Grupo por grupo
          </Text>
          <View className="flex-row items-center gap-1.5">
            <View className="h-3 w-0.5 bg-foreground" />
            <Text size={12} tone="subtle">
              alvo do perfil
            </Text>
          </View>
        </View>
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel={`Grupo por grupo, sua carteira contra o alvo do perfil ${label}: ${groups
            .map(
              (group) =>
                `${group.label} ${shareText(group.current)} contra ${shareText(group.target)}`,
            )
            .join('; ')}.`}
        >
          <GroupTargetList groups={groups} scale={scale} variant="card" />
        </View>
      </View>
      <View className="mt-auto flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border pt-3">
        <Text size={13} tone="muted" className="min-w-0 flex-shrink">
          {out.length ? (
            <>
              Fora do alvo em{' '}
              <Span weight="bold" tone="default">
                {`${out.length} de ${groups.length} grupos`}
              </Span>
              .
              {!isTablet && biggest ? (
                <>
                  {' '}
                  A maior diferença é{' '}
                  <Span weight="bold" tone="brand">
                    {biggest.label}
                  </Span>
                  ,{' '}
                  <Span weight="bold" tone="default">
                    {directionText(biggest.difference)}
                  </Span>
                  .
                </>
              ) : null}
            </>
          ) : (
            'Sua carteira está perto do alvo do perfil em todos os grupos.'
          )}
        </Text>
        <View className="flex-row flex-wrap gap-x-4 gap-y-1.5">
          <LinkButton
            label="Ver alocação completa"
            chevron={false}
            onPress={() => router.navigate('/investments/allocation')}
          />
          <LinkButton
            label="Rebalancear com o Pacu"
            chevron={false}
            onPress={() => router.navigate(conversationHref(undefined, { assistant: 'pacu' }))}
          />
        </View>
      </View>
    </SectionCard>
  );
}
