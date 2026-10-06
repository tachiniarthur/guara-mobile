import { colors } from '@guara/ui-tokens';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { PageHeader, ResponsiveGrid, Screen, SectionCard, TopBar } from '@/components/layout';
import { Button, Icon, IconButton, LinkButton, Span, Text } from '@/components/ui';
import { PRICE_ALERTS, PriceAlertRow } from '@/features/alerts';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { AccountMenuButton, ChatFab } from '@/navigation';

import {
  AllocationCard,
  DuplicateNotice,
  ExposureCard,
  PortfolioCard,
  PositionsCard,
  PropertiesCard,
  NewUserInvestments,
} from '../components';
import { usePositions } from '../hooks/usePositions';
import { PORTFOLIO } from '../data';

/** Investimentos: net worth, allocation vs profile, countries, assets, alerts and positions. */
export function InvestmentsScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const addInvestment = () => router.navigate('/new-manual-asset');
  // An empty portfolio shows where to start ("Investimentos · novo").
  const empty = usePositions().status === 'empty';

  const alertsCard = (
    <SectionCard
      title="Alertas de preço"
      description="Aviso por notificação e e-mail"
      titleSize={isTablet ? 20 : 18}
      padding={isTablet ? 20 : 16}
      gap={4}
      action={
        <LinkButton
          label="Novo"
          className="min-h-6"
          onPress={() => router.navigate('/new-price-alert')}
        />
      }
    >
      <View>
        {PRICE_ALERTS.map((alert) => (
          <PriceAlertRow key={alert.id} alert={alert} />
        ))}
      </View>
    </SectionCard>
  );

  return (
    <View className="flex-1">
      <Screen
        header={
          isTablet ? null : (
            <TopBar
              title="Investimentos"
              leading="none"
              actions={
                <>
                  <IconButton
                    icon="plus"
                    accessibilityLabel="Adicionar investimento"
                    onPress={addInvestment}
                  />
                  <AccountMenuButton />
                </>
              }
            />
          )
        }
        contentClassName={isTablet ? 'pb-32' : undefined}
      >
        {empty ? (
          <>
            {isTablet ? <PageHeader title="Investimentos" /> : null}
            <NewUserInvestments />
          </>
        ) : isTablet ? (
          <>
            <PageHeader
              title="Investimentos"
              subtitle={PORTFOLIO.quotesLabel}
              actions={
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={`Perfil de investidor: ${PORTFOLIO.profile}`}
                  onPress={() => router.navigate('/account/investor-profile')}
                  className="h-11 flex-row items-center gap-2 rounded-full border border-border-strong bg-surface px-3.5"
                >
                  <Icon name="shield" size={18} color={colors.foreground.DEFAULT} />
                  <Text size={14}>
                    Perfil <Span weight="bold">{PORTFOLIO.profile}</Span>
                  </Text>
                </Pressable>
              }
            />
            <View className="flex-row gap-2.5">
              <Button size="md" leftIcon="plus" className="px-4.5" onPress={addInvestment}>
                Adicionar investimento
              </Button>
              <Button
                variant="secondary"
                size="md"
                leftIcon="sprout"
                className="px-4.5"
                onPress={() => router.navigate('/investments/simulator')}
              >
                Simular cenário
              </Button>
            </View>
            <DuplicateNotice />
            <ResponsiveGrid columns={{ tablet: 2 }}>
              <PortfolioCard />
              <AllocationCard />
            </ResponsiveGrid>
            <ExposureCard />
            <ResponsiveGrid columns={{ tablet: 2 }}>
              <PropertiesCard />
              {alertsCard}
            </ResponsiveGrid>
            <PositionsCard />
          </>
        ) : (
          <>
            <Text variant="caption" tone="subtle">
              {PORTFOLIO.sourcesLabel}
            </Text>
            <PortfolioCard />
            <DuplicateNotice />
            <AllocationCard />
            <ExposureCard />
            <PropertiesCard />
            {alertsCard}
            <PositionsCard />
          </>
        )}
      </Screen>
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
