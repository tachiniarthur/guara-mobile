import { colors } from '@guara/ui-tokens';
import { formatCents } from '@guara/utils';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { EmptyState, ErrorState, toast } from '@/components/feedback';
import { PageHeader, Screen, TopBar } from '@/components/layout';
import {
  Button,
  Chip,
  Icon,
  InfoNote,
  LinkButton,
  MoneyText,
  OptionSheet,
  SearchInput,
  SegmentedControl,
  Text,
} from '@/components/ui';
import { routeTo } from '@/constants/routes';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { haptics } from '@/lib/haptics';
import { ChatFab } from '@/navigation';

import { PositionClassBand, PositionRow, PositionsTable, RiskSheet } from '../components';
import type { Position } from '../data';
import { usePositions } from '../hooks/usePositions';
import {
  ORIGIN_FILTERS,
  POSITION_SORTS,
  filterPositions,
  groupPositions,
  positionsCountText,
  sortPositions,
  tickerFromQuery,
  type OriginFilter,
  type PositionGrouping,
  type PositionSort,
} from '../lib/positions';

const NEW_ASSET = '/new-manual-asset';

/** "Posições" / "Todas as posições": search, grouping, sort, origin and every position. */
export function PositionsScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const data = usePositions();
  const [query, setQuery] = useState('');
  const [origin, setOrigin] = useState<OriginFilter>('all');
  const [grouping, setGrouping] = useState<PositionGrouping>('byClass');
  const [sort, setSort] = useState<PositionSort>('valueDesc');
  const [sortOpen, setSortOpen] = useState(false);
  const [riskTarget, setRiskTarget] = useState<Position | null>(null);

  const visible = sortPositions(filterPositions(data.positions, { query, origin }), sort);
  const groups = grouping === 'byClass' ? groupPositions(visible) : null;
  const count = positionsCountText(data.positions.length);
  const sortLabel = POSITION_SORTS.find((item) => item.value === sort)!.label;

  const open = (position: Position) => {
    if (data.hasAssetPage(position.ticker)) router.navigate(routeTo.asset(position.ticker));
    else toast.info(`A página de ${position.name} chega com as cotações da API.`);
  };
  const addAsset = (ticker?: string) =>
    router.navigate(ticker ? { pathname: NEW_ASSET, params: { ticker } } : NEW_ASSET);

  const header = isTablet ? (
    <PageHeader
      title="Todas as posições"
      subtitle={
        data.status === 'ready'
          ? `${count} · ${formatCents(data.total)} · cotações das ${data.quotesTime}`
          : undefined
      }
      breadcrumb={{
        parents: [{ label: 'Investimentos', href: '/investments' }],
        current: 'Posições',
      }}
      actions={
        <Button
          variant="secondary"
          size="md"
          leftIcon="plus"
          className="h-10 px-4.5"
          onPress={() => addAsset()}
        >
          Adicionar
        </Button>
      }
    />
  ) : data.status === 'ready' ? (
    <View className="flex-row items-center gap-2.5">
      <Text size={14} tone="muted" className="flex-1">
        {`${count} · atualizado às ${data.quotesTime}`}
      </Text>
      <LinkButton label="Adicionar" size={14} onPress={() => addAsset()} />
    </View>
  ) : null;

  const staleNotice = data.staleMessage ? (
    <InfoNote icon="alertTriangle" tone="warning" size={13} iconColor={colors.warning.DEFAULT}>
      {data.staleMessage}
    </InfoNote>
  ) : null;

  let card: ReactNode;
  if (data.status === 'error') {
    card = (
      <>
        {staleNotice}
        <ErrorState
          title="Não deu para carregar as posições"
          description="Suas posições continuam salvas. Tente de novo em instantes."
          onRetry={data.refetch}
        />
      </>
    );
  } else if (data.status === 'empty') {
    card = (
      <EmptyState
        icon="trendingUp"
        title="Nenhum investimento ainda"
        description="Conecte um banco ou corretora para trazer suas posições sozinhas, ou cadastre à mão o que não vem pelo Open Finance."
        actions={
          <>
            <Button variant="primary" size="md" onPress={() => router.navigate('/connect-bank')}>
              Conectar banco
            </Button>
            <Button variant="secondary" size="md" onPress={() => addAsset()}>
              Cadastrar à mão
            </Button>
          </>
        }
      />
    );
  } else {
    const ticker = tickerFromQuery(query);
    const typed = query.trim();
    const noResults = !typed ? (
      <EmptyState
        icon="filter"
        title="Nenhuma posição com essa origem"
        description="Mude o filtro para ver as outras posições da carteira."
        action={{ label: 'Ver todas as origens', onPress: () => setOrigin('all') }}
      />
    ) : (
      <EmptyState
        icon="search"
        title={`Nenhuma posição com “${ticker ?? typed}”`}
        description="Você não tem esse ativo na carteira. Quer cadastrar?"
        action={{
          label: ticker ? `Adicionar ${ticker}` : 'Cadastrar à mão',
          icon: 'plus',
          onPress: () => addAsset(ticker ?? undefined),
        }}
      />
    );

    const rows = (positions: Position[]) =>
      positions.map((position) => (
        <PositionRow
          key={position.id}
          position={position}
          onPress={() => open(position)}
          onAdjustRisk={() => setRiskTarget(position)}
        />
      ));
    const list =
      visible.length === 0 ? (
        noResults
      ) : isTablet ? (
        <PositionsTable
          groups={groups}
          positions={visible}
          onOpen={open}
          onAdjustRisk={setRiskTarget}
        />
      ) : (
        <View className="gap-1">
          {groups
            ? groups.map((group) => (
                <View key={group.key}>
                  <PositionClassBand
                    label={group.label}
                    total={group.total}
                    share={group.share}
                    count={group.positions.length}
                  />
                  {rows(group.positions)}
                </View>
              ))
            : rows(visible)}
        </View>
      );

    const chips = ORIGIN_FILTERS.map((item) => (
      <Chip
        key={item.value}
        label={item.label}
        selected={origin === item.value}
        appearance="filled"
        textSize={14}
        onPress={() => setOrigin(item.value)}
      />
    ));

    card = (
      <>
        {staleNotice}
        <SearchInput
          size={46}
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por nome ou código (ex.: HGLG11)"
        />
        <View className="flex-row flex-wrap items-center justify-between gap-2.5">
          <SegmentedControl
            accessibilityLabel="Agrupar posições"
            track="input"
            size="sm"
            textSize={14}
            value={grouping}
            onChange={setGrouping}
            options={[
              { value: 'list', label: 'Lista' },
              { value: 'byClass', label: 'Por classe' },
            ]}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ordenar posições: ${sortLabel}`}
            onPress={() => {
              haptics.selection();
              setSortOpen(true);
            }}
            className="h-9 flex-row items-center gap-1.5 rounded-full border border-border-strong px-3 active:bg-surface-pressed"
          >
            <Icon name="sort" size={16} color={colors.foreground.DEFAULT} />
            <Text size={14} weight="semibold">
              {sortLabel}
            </Text>
            <Icon name="chevronDown" size={14} color={colors.foreground.DEFAULT} />
          </Pressable>
        </View>
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
        {list}
        <View className="flex-row items-baseline justify-between gap-2 border-t border-border-strong pt-3.5">
          <Text serif weight="bold" size={17}>
            Total da carteira
          </Text>
          <MoneyText
            value={data.total}
            serif
            weight="extrabold"
            size={22}
            leading={1.1}
            tracking={-0.01}
          />
        </View>
      </>
    );
  }

  const footnote =
    data.status === 'ready' ? (
      <Text size={13} leading={1.55} tone="subtle">
        {isTablet
          ? 'Toque no selo de risco para ajustar. Preço médio aparece só quando foi informado.'
          : 'Toque no selo de risco para ajustar. O risco vem do cadastro do ativo (volatilidade, crédito e liquidez).'}
      </Text>
    ) : null;

  // On phones the list sits on the page; states and the tablet table sit on a card.
  const framed = isTablet || data.status !== 'ready';

  return (
    <View className="flex-1">
      <Screen
        header={isTablet ? null : <TopBar title="Posições" fallbackHref="/investments" />}
        contentClassName={isTablet ? 'gap-5 pb-32' : 'gap-4 pt-1'}
      >
        {header}
        {framed ? (
          <View
            className="gap-3.5 rounded-24 border border-border bg-surface"
            style={{ padding: isTablet ? 22 : 16 }}
          >
            {card}
          </View>
        ) : (
          card
        )}
        {footnote}
      </Screen>
      <RiskSheet target={riskTarget} onClose={() => setRiskTarget(null)} onChange={data.setRisk} />
      <OptionSheet
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        title="Ordenar posições"
        value={sort}
        options={POSITION_SORTS}
        onChange={setSort}
      />
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
