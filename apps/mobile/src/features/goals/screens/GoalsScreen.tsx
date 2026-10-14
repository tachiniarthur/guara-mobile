import { formatCents, cents, sumCents } from '@guara/utils';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { ScreenStates, StateMessage, useScreenStatus } from '@/components/feedback';
import { MataButton } from '@/components/illustrations';
import { PageHeader, ResponsiveGrid, Screen, TopBar } from '@/components/layout';
import { Button, Card, EmptyValue, IconButton, LinkButton, MoneyText } from '@/components/ui';
import { AssistantNote } from '@/features/chat';
import { HOUSEHOLD } from '@/features/simulator';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ChatFab, conversationHref } from '@/navigation';

import { GoalCard, GoalHero, HeroCaption, HeroStrong } from '../components';
import { GOALS_SYNCED_AT, GOALS_TODAY } from '../data';
import { useGoals } from '../hooks/useGoals';
import { listNote, plannedDeposits } from '../lib/goals';

const whole = (value: number) => formatCents(value, { wholeUnits: true });

/** "Suas metas": total saved, the Onça's reading and one card per goal. */
export function GoalsScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const goalsData = useGoals();
  const { goals, refetch } = goalsData;
  // The API adds loading; no goals is the list's empty state.
  const status = useScreenStatus(
    goalsData.status === 'ready' && goals.length === 0 ? 'empty' : goalsData.status,
  );
  const newGoal = () => router.navigate('/new-goal');
  const openGoal = (goalId: string) =>
    router.navigate({ pathname: '/goals/[goalId]', params: { goalId } });

  const header = isTablet ? (
    <PageHeader
      title="Suas metas"
      subtitle={
        goalsData.status === 'ready' && goals.length > 0
          ? `Acompanhadas pela Onça · ${goals.length} ${goals.length === 1 ? 'meta' : 'metas'}`
          : undefined
      }
      actions={
        goals.length > 0 ? <MataButton label="Nova meta" size={44} onPress={newGoal} /> : null
      }
    />
  ) : null;

  let content;
  if (status === 'empty') {
    // One message in place of the whole list.
    content = (
      <Card padding="sm" className="p-4">
        <StateMessage
          icon="target"
          title="Nenhuma meta ainda"
          description="Crie uma meta, como reserva de emergência ou viagem, e acompanhe o ritmo dos depósitos."
          action={<MataButton label="Criar primeira meta" size={44} onPress={newGoal} />}
        />
      </Card>
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
        {status === 'error' ? (
          <EmptyValue />
        ) : (
          <>
            {isTablet ? null : <MataButton label="Nova meta" fullWidth onPress={newGoal} />}
            <LinkButton
              label="Ver simulações salvas"
              onPress={() => router.navigate('/investments/simulator/saved')}
              className="self-start"
            />
          </>
        )}
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
        <ScreenStates status={status} onRetry={refetch} since={GOALS_SYNCED_AT}>
          {content}
        </ScreenStates>
      </Screen>
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
