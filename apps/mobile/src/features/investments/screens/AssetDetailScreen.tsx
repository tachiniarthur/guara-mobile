import { formatCents } from '@guara/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

import { EmptyState, ScreenStates, useScreenStatus } from '@/components/feedback';
import { Breadcrumb, ResponsiveGrid, Screen, TopBar } from '@/components/layout';
import { Text } from '@/components/ui';
import { AskAssistantCard } from '@/features/chat';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ChatFab } from '@/navigation';

import { ASSETS, type FundAsset, type StockAsset } from '../assets';
import {
  AssetActions,
  AssetDetailsCard,
  AssetIdentity,
  DividendsCard,
  EventsCard,
  FeesCard,
  FundChartCard,
  FundPositionCard,
  MetricsCard,
  NotHeldPositionCard,
  QuoteCard,
  RangeCard,
  RowsCard,
  StockPositionCard,
  StockQuoteHeadline,
} from '../components';
import { PORTFOLIO } from '../data';
import { usePositions } from '../hooks/usePositions';

function Footnote({ children }: { children: string }) {
  return (
    <Text size={12} tone="subtle">
      {children}
    </Text>
  );
}

/** Opens "Eventos corporativos" of the asset. */
function useOpenEvents() {
  const router = useRouter();
  return (ticker: string) =>
    router.navigate({ pathname: '/investments/asset/[ticker]/events', params: { ticker } });
}

function StockDetail({ asset, wide, held }: { asset: StockAsset; wide: boolean; held: boolean }) {
  const openEvents = useOpenEvents();
  const current = formatCents(asset.price);
  const today = (
    <RangeCard
      title="Hoje"
      description={asset.today.label}
      range={asset.today}
      current={current}
      wide={wide}
    />
  );
  const year = (
    <RangeCard
      title="52 semanas"
      description="Mínima e máxima do ano"
      range={asset.year}
      current={current}
      wide={wide}
    />
  );
  const fundamentals = (
    <RowsCard
      title="Indicadores"
      description="Último balanço"
      rows={asset.fundamentals}
      wide={wide}
    />
  );
  const company = (
    <RowsCard title="Sobre a empresa" rows={asset.company.rows} wide={wide} empty={null}>
      <Text size={14} leading={1.6} tone="muted">
        {asset.company.about}
      </Text>
    </RowsCard>
  );

  return (
    <>
      <View className={wide ? 'gap-4' : 'gap-3.5'}>
        <AssetIdentity header={asset.header} tile={wide ? 56 : 48} titleSize={wide ? 30 : 26} />
        <StockQuoteHeadline asset={asset} large={wide} />
        {wide ? <AssetActions asset={asset} layout="row" /> : null}
      </View>
      {wide ? null : <AssetActions asset={asset} layout="grid" />}
      <QuoteCard asset={asset} wide={wide} />
      {held ? (
        <StockPositionCard asset={asset} wide={wide} />
      ) : (
        <NotHeldPositionCard ticker={asset.header.ticker} wide={wide} />
      )}
      {wide ? (
        <>
          <ResponsiveGrid columns={{ tablet: 2 }} gap={16} stretch>
            {today}
            {year}
          </ResponsiveGrid>
          <ResponsiveGrid columns={{ tablet: 2 }} gap={16} stretch>
            {fundamentals}
            {company}
          </ResponsiveGrid>
          <DividendsCard asset={asset} wide />
        </>
      ) : (
        <>
          {today}
          {year}
          {fundamentals}
          <DividendsCard asset={asset} />
          {company}
        </>
      )}
      <MetricsCard metrics={asset.metrics} wide={wide} />
      <EventsCard
        kind="list"
        ticker={asset.header.ticker}
        wide={wide}
        {...asset.events}
        onSeeAll={() => openEvents(asset.header.ticker)}
      />
      <Footnote>{asset.footnote}</Footnote>
    </>
  );
}

function FundDetail({ asset, wide, held }: { asset: FundAsset; wide: boolean; held: boolean }) {
  const openEvents = useOpenEvents();
  const position = held ? (
    <FundPositionCard asset={asset} />
  ) : (
    <NotHeldPositionCard ticker={asset.header.ticker} wide={wide} />
  );
  return (
    <>
      {wide ? (
        <View className="flex-row flex-wrap items-end justify-between gap-5">
          <AssetIdentity header={asset.header} tile={56} titleSize={34} />
          <AssetActions asset={asset} layout="row" />
        </View>
      ) : (
        <View className="gap-3.5">
          <AssetIdentity header={asset.header} />
          <AssetActions asset={asset} layout="stack" />
        </View>
      )}
      <FundChartCard asset={asset} wide={wide} />
      {wide ? (
        <ResponsiveGrid columns={{ tablet: 2 }} gap={16} stretch>
          <AssetDetailsCard asset={asset} />
          {position}
        </ResponsiveGrid>
      ) : (
        <>
          {position}
          <AssetDetailsCard asset={asset} />
        </>
      )}
      <FeesCard asset={asset} />
      <MetricsCard metrics={asset.metrics} wide={wide} />
      <EventsCard
        ticker={asset.header.ticker}
        wide={wide}
        {...asset.events}
        onSeeAll={() => openEvents(asset.header.ticker)}
      />
      <AskAssistantCard
        assistant="pacu"
        subject="sobre este ativo"
        questions={asset.questions}
        divided
      />
      <Footnote>{asset.footnote}</Footnote>
    </>
  );
}

/** Asset page: quote or return chart, position, details, fees, indicators and payments. */
export function AssetDetailScreen() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>();
  const { isTablet } = useBreakpoint();
  const asset = ticker ? ASSETS[ticker] : undefined;
  const { positions } = usePositions();
  // Static data today: the API adds loading and error. "Empty": Brapi has no data of the asset.
  const status = useScreenStatus('ready');
  const held = positions.some((item) => item.ticker === ticker);

  return (
    <View className="flex-1">
      <Screen
        // A new asset opens from the top (the route stays mounted when only the ticker changes).
        key={ticker}
        header={
          isTablet ? null : (
            <TopBar title="Detalhes do ativo" leading="back" fallbackHref="/investments" />
          )
        }
        contentClassName={isTablet ? 'gap-5 pb-32' : 'gap-4 pt-2'}
      >
        {isTablet ? (
          <Breadcrumb
            parents={[{ label: 'Investimentos', href: '/investments' }]}
            current={asset?.header.title ?? 'Ativo'}
          />
        ) : null}
        {!asset ? (
          <EmptyState
            icon="search"
            title="Ativo não encontrado"
            description="Ele pode ter sido removido da sua carteira."
          />
        ) : (
          <ScreenStates status={status} onRetry={() => undefined} since={PORTFOLIO.quotedAt}>
            {asset.kind === 'stock' ? (
              <StockDetail asset={asset} wide={isTablet} held={held} />
            ) : (
              <FundDetail asset={asset} wide={isTablet} held={held} />
            )}
          </ScreenStates>
        )}
      </Screen>
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
