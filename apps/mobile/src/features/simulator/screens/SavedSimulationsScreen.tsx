import { colors } from '@guara/ui-tokens';
import { EMPTY } from '@guara/utils';
import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import {
  FilterEmpty,
  ScreenStates,
  StateMessage,
  StateSlot,
  useScreenStatus,
} from '@/components/feedback';
import { MataButton } from '@/components/illustrations';
import { PageHeader, Screen, TopBar } from '@/components/layout';
import { Button, Card, Chip, Icon, IconButton, Span, Text, type IconName } from '@/components/ui';
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

/** Last sync of the saved simulations (shown while offline). */
const SIMULATIONS_SYNCED_AT = '2026-09-23T17:30:00.000Z';

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
    <Card padding="none" className="rounded-20 px-4 py-3.5">
      <StateSlot compact>
        <View className="flex-row items-center gap-3">
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
      </StateSlot>
    </Card>
  );
}

/** Seconds to undo a deletion. */
const UNDO_SECONDS = 10;

/** "“Aposentadoria aos 60” excluída · Dá para desfazer por 10 segundos." over the bottom. */
function UndoNotice({
  name,
  onUndo,
  onClose,
}: {
  name: string;
  onUndo: () => void;
  onClose: () => void;
}) {
  return (
    <View
      accessibilityRole="summary"
      accessibilityLiveRegion="polite"
      className="flex-row items-center gap-3 rounded-18 border border-foreground-muted bg-surface-input py-3 pl-3.5 pr-2"
      style={{
        shadowColor: colors.shadow,
        shadowOpacity: 0.45,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 12 },
        elevation: 12,
      }}
    >
      <View className="h-9 w-9 items-center justify-center rounded-12 bg-surface-muted">
        <Icon name="trash" size={18} />
      </View>
      <View className="min-w-0 flex-1">
        <Text size={15} weight="bold" leading={1.35}>
          {`“${name}” excluída`}
        </Text>
        <Text size={13} tone="muted" leading={1.35}>
          {`Dá para desfazer por ${UNDO_SECONDS} segundos.`}
        </Text>
      </View>
      <Button variant="secondary" size="md" leftIcon="retry" className="h-10" onPress={onUndo}>
        Desfazer
      </Button>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fechar aviso"
        hitSlop={4}
        onPress={onClose}
        className="h-9 w-9 items-center justify-center rounded-full active:bg-surface-pressed"
      >
        <Icon name="close" size={16} />
      </Pressable>
    </View>
  );
}

/** "Simulações salvas": scenarios saved in the simulator, by kind, with undo after deleting. */
export function SavedSimulationsScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const data = useSavedSimulations();
  const { saved, refetch } = data;
  // The API adds loading; nothing saved is the list's empty state.
  const status = useScreenStatus(
    data.status === 'ready' && saved.length === 0 ? 'empty' : data.status,
  );
  const removed = useSimulationsStore((state) => state.removed);
  const remove = useSimulationsStore((state) => state.remove);
  const undoRemove = useSimulationsStore((state) => state.undoRemove);
  const forgetRemoved = useSimulationsStore((state) => state.forgetRemoved);
  // The deletion can be undone for a few seconds.
  useEffect(() => {
    if (!removed) return;
    const timer = setTimeout(forgetRemoved, UNDO_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [removed, forgetRemoved]);
  const [filter, setFilter] = useState<SimulationFilter>('all');
  const visible = filterSimulations(saved, filter);
  const openSimulator = () => router.navigate('/investments/simulator');

  const header = isTablet ? (
    <PageHeader
      title="Simulações salvas"
      subtitle={
        data.status === 'ready' && saved.length > 0 ? simulationsCountText(saved.length) : undefined
      }
      breadcrumb={{
        parents: [{ label: 'Simulador', href: '/investments/simulator' }],
        current: 'Simulações salvas',
      }}
    />
  ) : null;

  const undo = removed ? (
    <UndoNotice
      name={removed.simulation.name}
      onUndo={() => {
        haptics.selection();
        undoRemove();
      }}
      onClose={forgetRemoved}
    />
  ) : null;

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

  const list =
    status === 'empty' ? (
      // One message in place of the list.
      <Card padding="sm" className="p-4">
        <StateMessage
          icon="sliders"
          title="Nenhuma simulação salva"
          description="Simule aposentadoria, um objetivo ou um corte de gasto e salve para comparar depois."
          action={<MataButton label="Abrir o simulador" size={44} onPress={openSimulator} />}
        />
      </Card>
    ) : visible.length === 0 ? (
      <Card padding="sm" className="p-4">
        <FilterEmpty
          description={`Nenhuma simulação de ${SIMULATION_KIND_LABELS[filter as SimulationKind].toLowerCase()}. As desse tipo que você salvar aparecem aqui.`}
          onClear={() => setFilter('all')}
        />
      </Card>
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
    );

  const content = (
    <ScreenStates status={status} onRetry={refetch} since={SIMULATIONS_SYNCED_AT}>
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
      <View className="gap-2.5">{list}</View>
      {status === 'empty' ? null : (
        <Text size={13} leading={1.55} tone="subtle">
          {status === 'error'
            ? EMPTY
            : 'Simulações usam seus números do dia em que foram salvas. Ao abrir, você pode atualizar com os dados de hoje.'}
        </Text>
      )}
    </ScreenStates>
  );

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
      {undo ? (
        <View
          pointerEvents="box-none"
          className="absolute bottom-3 left-0 right-0 items-center px-3"
        >
          <View style={{ width: isTablet ? 560 : '100%', maxWidth: '100%' }}>{undo}</View>
        </View>
      ) : null}
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
