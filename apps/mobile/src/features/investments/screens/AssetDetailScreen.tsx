import { formatCents } from '@guara/utils';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { EmptyState } from '@/components/feedback';
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
  QuoteCard,
  RangeCard,
  RowsCard,
  StockPositionCard,
  StockQuoteHeadline,
} from '../components';

function Footnote({ children }: { children: string }) {
  return (
    <Text size={12} tone="subtle">
      {children}
    </Text>
  );
}

function StockDetail({ asset, wide }: { asset: StockAsset; wide: boolean }) {
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
    <RowsCard title="Sobre a empresa" rows={asset.company.rows} wide={wide}>
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
      <StockPositionCard asset={asset} wide={wide} />
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
      <EventsCard kind="list" wide={wide} {...asset.events} />
      <Footnote>{asset.footnote}</Footnote>
    </>
  );
}

function FundDetail({ asset, wide }: { asset: FundAsset; wide: boolean }) {
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
          <FundPositionCard asset={asset} />
        </ResponsiveGrid>
      ) : (
        <>
          <FundPositionCard asset={asset} />
          <AssetDetailsCard asset={asset} />
        </>
      )}
      <FeesCard asset={asset} />
      <MetricsCard metrics={asset.metrics} wide={wide} />
      <EventsCard wide={wide} {...asset.events} />
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
        ) : asset.kind === 'stock' ? (
          <StockDetail asset={asset} wide={isTablet} />
        ) : (
          <FundDetail asset={asset} wide={isTablet} />
        )}
      </Screen>
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
