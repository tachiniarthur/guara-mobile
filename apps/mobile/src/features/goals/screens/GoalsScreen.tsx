import { formatCents, cents, sumCents } from '@guara/utils';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { EmptyState, ErrorState } from '@/components/feedback';
import { MataButton } from '@/components/illustrations';
import { PageHeader, ResponsiveGrid, Screen, TopBar } from '@/components/layout';
import { Button, IconButton, LinkButton, MoneyText } from '@/components/ui';
import { AssistantNote } from '@/features/chat';
import { HOUSEHOLD } from '@/features/simulator';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ChatFab, conversationHref } from '@/navigation';

import { GoalCard, GoalHero, HeroCaption, HeroStrong } from '../components';
import { GOALS_TODAY } from '../data';
import { useGoals } from '../hooks/useGoals';
import { listNote, plannedDeposits } from '../lib/goals';

const whole = (value: number) => formatCents(value, { wholeUnits: true });

/** "Suas metas": total saved, the Onça's reading and one card per goal. */
export function GoalsScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { status, goals, refetch } = useGoals();
  const newGoal = () => router.navigate('/new-goal');
  const openGoal = (goalId: string) =>
    router.navigate({ pathname: '/goals/[goalId]', params: { goalId } });

  const header = isTablet ? (
    <PageHeader
      title="Suas metas"
      subtitle={
        status === 'ready' && goals.length > 0
          ? `Acompanhadas pela Onça · ${goals.length} ${goals.length === 1 ? 'meta' : 'metas'}`
          : undefined
      }
      actions={
        goals.length > 0 ? <MataButton label="Nova meta" size={44} onPress={newGoal} /> : null
      }
    />
  ) : null;

  let content;
  if (status === 'error') {
    content = (
      <View className="rounded-24 border border-border bg-surface p-3">
        <ErrorState
          title="Não conseguimos carregar suas metas"
          description="Suas metas estão salvas. É a conexão que falhou agora. Tente de novo em instantes."
          onRetry={refetch}
        />
      </View>
    );
  } else if (goals.length === 0) {
    content = (
      <View className="rounded-24 border border-border bg-surface p-3">
        <EmptyState
          icon="target"
          title="Nenhuma meta ainda"
          description="Uma meta junta dinheiro para algo que você quer, com depósito mensal e prazo. A Onça acompanha o ritmo com você."
          actions={
            <>
              <MataButton label="Criar primeira meta" size={44} onPress={newGoal} />
              <Button
                variant="secondary"
                size="md"
                onPress={() => router.navigate('/investments/simulator/goal')}
              >
                Usar o simulador
              </Button>
            </>
          }
        />
      </View>
    );
  } else {
    const saved = sumCents(goals.map((goal) => goal.saved));
    const planned = plannedDeposits(goals);
    const note = listNote(goals, GOALS_TODAY);
    const hero = (
      <GoalHero
        label="Guardado nas metas"
        value={
          <MoneyText
            value={saved}
            wholeUnits
            serif
            weight="extrabold"
            size={34}
            leading={1.1}
            tracking={-0.01}
          />
        }
      >
        <HeroCaption>
          Depósitos planejados: <HeroStrong>{`${whole(planned.total)}/mês`}</HeroStrong>
          {planned.without.length > 0 ? ` sem a ${planned.without.join(' e a ')}` : ''} · sobrou{' '}
          {formatCents(cents(Math.round(HOUSEHOLD.surplus * 100)))} em setembro
        </HeroCaption>
      </GoalHero>
    );
    const onca = note ? (
      <AssistantNote
        assistant="onca"
        actions={
          <Button
            variant="secondary"
            size="md"
            leftIcon="message"
            className="h-10 px-4.5"
            onPress={() => router.navigate(conversationHref(undefined, { assistant: 'onca' }))}
          >
            Conversar com a Onça
          </Button>
        }
      >
        {note}
      </AssistantNote>
    ) : null;
    const cards = goals.map((goal) => (
      <GoalCard key={goal.id} goal={goal} onPress={() => openGoal(goal.id)} />
    ));

    content = (
      <>
        {isTablet ? (
          <ResponsiveGrid columns={{ tablet: 2 }}>
            {hero}
            {onca ?? <View />}
          </ResponsiveGrid>
        ) : (
          <>
            {hero}
            {onca}
          </>
        )}
        {isTablet ? <ResponsiveGrid columns={{ tablet: 2 }}>{cards}</ResponsiveGrid> : cards}
        {isTablet ? null : <MataButton label="Nova meta" fullWidth onPress={newGoal} />}
        <LinkButton
          label="Ver simulações salvas"
          onPress={() => router.navigate('/investments/simulator/saved')}
          className="self-start"
        />
      </>
    );
  }

  return (
    <View className="flex-1">
      <Screen
        header={
          isTablet ? null : (
            <TopBar
              title="Suas metas"
              fallbackHref="/"
              actions={<IconButton icon="plus" accessibilityLabel="Nova meta" onPress={newGoal} />}
            />
          )
        }
        contentClassName={isTablet ? 'pb-32' : undefined}
      >
        {header}
        {content}
      </Screen>
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
