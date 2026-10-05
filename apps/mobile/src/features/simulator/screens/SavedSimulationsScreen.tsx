import { colors } from '@guara/ui-tokens';
import { useRouter, type Href } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { EmptyState, ErrorState } from '@/components/feedback';
import { PageHeader, Screen, TopBar } from '@/components/layout';
import { Chip, Icon, IconButton, LinkButton, Span, Text, type IconName } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { haptics } from '@/lib/haptics';
import { ChatFab } from '@/navigation';

import { SIMULATION_KIND_LABELS, type SavedSimulation, type SimulationKind } from '../data';
import { useSavedSimulations } from '../hooks/useSavedSimulations';
import {
  filterSimulations,
  savedCaption,
  savedSummary,
  simulationsCountText,
  type SimulationFilter,
} from '../lib/saved';
import { useSimulationsStore } from '../store';

const FILTERS: { value: SimulationFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'retirement', label: SIMULATION_KIND_LABELS.retirement },
  { value: 'goal', label: SIMULATION_KIND_LABELS.goal },
  { value: 'cut', label: SIMULATION_KIND_LABELS.cut },
];

const KIND_ICON: Record<SimulationKind, IconName> = {
  retirement: 'sparkle',
  goal: 'target',
  cut: 'trendingUp',
};

const KIND_ROUTE = {
  retirement: '/investments/simulator/retirement',
  goal: '/investments/simulator/goal',
  cut: '/investments/simulator/cut-expense',
} as const;

/** Opens the simulator tab with the saved premises (`?saved=<id>`). */
export function savedSimulationHref(simulation: SavedSimulation): Href {
  return { pathname: KIND_ROUTE[simulation.input.kind], params: { saved: simulation.id } };
}

function SimulationCard({
  simulation,
  all,
  onOpen,
  onRemove,
}: {
  simulation: SavedSimulation;
  all: readonly SavedSimulation[];
  onOpen: () => void;
  onRemove: () => void;
}) {
  const kind = simulation.input.kind;
  const summary = savedSummary(simulation, all);
  const caption = savedCaption(simulation);
  return (
    <View className="flex-row items-center gap-3 rounded-20 border border-border bg-surface px-4 py-3.5">
      <View className="h-10 w-10 items-center justify-center rounded-12 bg-info-muted">
        <Icon name={KIND_ICON[kind]} size={20} color={colors.info.DEFAULT} />
      </View>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${SIMULATION_KIND_LABELS[kind]}: ${simulation.name}. ${summary.amount ?? ''} ${summary.detail}. ${caption}`}
        onPress={onOpen}
        className="min-w-0 flex-1 active:opacity-80"
      >
        <Text size={12} weight="bold" tone="subtle" tracking={0.06} leading={1.35}>
          {SIMULATION_KIND_LABELS[kind].toUpperCase()}
        </Text>
        <Text size={16} weight="bold" leading={1.35}>
          {simulation.name}
        </Text>
        <Text size={13} tone="muted" leading={1.35}>
          {summary.amount ? <Span weight="bold">{summary.amount}</Span> : null}
          {summary.amount ? ' · ' : ''}
          {summary.detail}
        </Text>
        <Text size={12} tone="subtle" leading={1.35}>
          {caption}
        </Text>
      </Pressable>
      <IconButton
        icon="trash"
        accessibilityLabel={`Excluir simulação ${simulation.name}`}
        onPress={onRemove}
      />
    </View>
  );
}

/** "Simulações salvas": scenarios saved in the simulator, by kind, with undo after deleting. */
export function SavedSimulationsScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { status, saved, refetch } = useSavedSimulations();
  const removed = useSimulationsStore((state) => state.removed);
  const remove = useSimulationsStore((state) => state.remove);
  const undoRemove = useSimulationsStore((state) => state.undoRemove);
  const [filter, setFilter] = useState<SimulationFilter>('all');
  const visible = filterSimulations(saved, filter);
  const openSimulator = () => router.navigate('/investments/simulator');

  const header = isTablet ? (
    <PageHeader
      title="Simulações salvas"
      subtitle={
        status === 'ready' && saved.length > 0 ? simulationsCountText(saved.length) : undefined
      }
      breadcrumb={{
        parents: [{ label: 'Simulador', href: '/investments/simulator' }],
        current: 'Simulações salvas',
      }}
    />
  ) : null;

  const undo = removed ? (
    <View className="flex-row items-center gap-3 rounded-16 bg-surface-muted px-4 py-3.5">
      <Text size={14} className="flex-1" accessibilityLiveRegion="polite">
        {`“${removed.simulation.name}” excluída`}
      </Text>
      <LinkButton
        label="Desfazer"
        chevron={false}
        onPress={() => {
          haptics.selection();
          undoRemove();
        }}
      />
    </View>
  ) : null;

  let content: ReactNode;
  if (status === 'error') {
    content = (
      <View className="rounded-24 border border-border bg-surface p-3">
        <ErrorState
          title="Não deu para carregar as simulações"
          description="Elas continuam salvas. Verifique a conexão e tente de novo."
          onRetry={refetch}
        />
      </View>
    );
  } else if (saved.length === 0) {
    content = (
      <>
        {undo}
        <View className="rounded-24 border border-border bg-surface p-3">
          <EmptyState
            icon="trendingUp"
            title="Nenhuma simulação salva"
            description="Toque em “Salvar” em qualquer simulador para guardar o cenário e comparar depois."
            action={{ label: 'Abrir o simulador', variant: 'primary', onPress: openSimulator }}
          />
        </View>
      </>
    );
  } else {
    const chips = FILTERS.map((item) => (
      <Chip
        key={item.value}
        label={item.label}
        selected={filter === item.value}
        appearance="filled"
        textSize={14}
        onPress={() => setFilter(item.value)}
      />
    ));
    content = (
      <>
        {isTablet ? (
          <View className="flex-row flex-wrap gap-2">{chips}</View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginRight: -16 }}
            contentContainerStyle={{ gap: 8, paddingRight: 16 }}
          >
            {chips}
          </ScrollView>
        )}
        {undo}
        <View className="gap-2.5">
          {visible.length === 0 ? (
            <EmptyState
              icon="filter"
              title={`Nenhuma simulação de ${SIMULATION_KIND_LABELS[filter as SimulationKind].toLowerCase()}`}
              description="As simulações desse tipo que você salvar aparecem aqui."
              action={{ label: 'Ver todas', onPress: () => setFilter('all') }}
            />
          ) : (
            visible.map((simulation) => (
              <SimulationCard
                key={simulation.id}
                simulation={simulation}
                all={saved}
                onOpen={() => router.push(savedSimulationHref(simulation))}
                onRemove={() => {
                  haptics.selection();
                  remove(simulation.id);
                }}
              />
            ))
          )}
        </View>
        <Text size={13} leading={1.55} tone="subtle">
          Simulações usam seus números do dia em que foram salvas. Ao abrir, você pode atualizar com
          os dados de hoje.
        </Text>
      </>
    );
  }

  return (
    <View className="flex-1">
      <Screen
        header={
          isTablet ? null : (
            <TopBar title="Simulações salvas" fallbackHref="/investments/simulator" />
          )
        }
        contentClassName={isTablet ? 'gap-5 pb-32' : 'gap-4 pt-1'}
      >
        {header}
        {content}
      </Screen>
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
