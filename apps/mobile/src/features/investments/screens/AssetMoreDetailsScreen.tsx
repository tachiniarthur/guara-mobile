import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

import { EmptyState } from '@/components/feedback';
import { PageHeader, ResponsiveGrid, Screen, SectionCard, TopBar } from '@/components/layout';
import { DataRow, Text } from '@/components/ui';
import { routeTo } from '@/constants/routes';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ChatFab } from '@/navigation';

import { ASSETS } from '../assets';

/** "Mais detalhes" of an asset: identification, trading, costs and the risk in the Guará. */
export function AssetMoreDetailsScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { ticker } = useLocalSearchParams<{ ticker: string }>();
  const asset = ticker ? ASSETS[ticker] : undefined;
  const details = asset?.kind === 'fund' ? asset.moreDetails : undefined;
  const title = asset?.header.title ?? ticker ?? '';

  const header = isTablet ? (
    <PageHeader
      title="Detalhes do ativo"
      subtitle={title}
      breadcrumb={{
        parents: [
          { label: 'Investimentos', href: '/investments' },
          { label: title, href: routeTo.asset(ticker ?? '') },
        ],
        current: 'Mais detalhes',
      }}
    />
  ) : null;

  const sections = details?.sections.map((section) => (
    <SectionCard key={section.title} title={section.title} titleSize={17} padding={18} gap={4}>
      <View>
        {section.rows.map((row) => (
          <DataRow key={row.label} label={row.label} value={row.value} />
        ))}
      </View>
    </SectionCard>
  ));

  return (
    <View className="flex-1">
      <Screen
        header={
          isTablet ? null : (
            <TopBar title="Detalhes do ativo" subtitle={title} fallbackHref="/investments" />
          )
        }
        contentClassName={isTablet ? 'gap-5 pb-32' : 'gap-4 pt-1'}
      >
        {header}
        {details ? (
          <>
            {isTablet ? (
              <ResponsiveGrid columns={{ tablet: 2 }} gap={16}>
                {sections}
              </ResponsiveGrid>
            ) : (
              sections
            )}
            <Text size={13} leading={1.55} tone="subtle">
              {details.note}
            </Text>
          </>
        ) : (
          <EmptyState
            icon="fileText"
            title="Sem mais detalhes"
            description="Ainda não temos outros dados deste ativo."
            action={{ label: 'Voltar ao ativo', onPress: () => router.back() }}
          />
        )}
      </Screen>
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
