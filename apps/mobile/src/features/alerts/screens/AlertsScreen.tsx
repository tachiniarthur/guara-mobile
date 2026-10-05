import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { PageHeader, ResponsiveGrid, Screen, SectionCard, TopBar } from '@/components/layout';
import { Button } from '@/components/ui';
import { MonthBudgetRow } from '@/features/spending';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ChatFab } from '@/navigation';

import { NoticeHistoryRow, PriceAlertRow } from '../components';
import { ALERT_BUDGETS, ALERTS_SUBTITLE, NOTICE_HISTORY, PRICE_ALERTS } from '../data';

/** Alertas: spending caps, price alerts and the notices already sent. */
export function AlertsScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const newBudget = () => router.navigate('/new-budget');
  const newPriceAlert = () => router.navigate('/new-price-alert');

  const budgetsCard = (
    <SectionCard
      title="Tetos do mês"
      description="Cada aviso chega uma vez por mês, somando crédito e débito"
      titleSize={isTablet ? 20 : 18}
      padding={isTablet ? 20 : 16}
      gap={isTablet ? 20 : 14}
      className="flex-1"
    >
      <View className="gap-5.5">
        {ALERT_BUDGETS.map((budget) => (
          <MonthBudgetRow key={budget.category} {...budget} />
        ))}
      </View>
    </SectionCard>
  );

  const priceCard = (
    <SectionCard
      title="Alertas de preço"
      description="Aviso por notificação e e-mail"
      titleSize={isTablet ? 20 : 18}
      padding={isTablet ? 20 : 16}
      gap={4}
      className="flex-1"
      action={
        <Button
          variant="secondary"
          size="md"
          leftIcon="plus"
          className="h-10 px-4.5"
          onPress={newPriceAlert}
        >
          Novo
        </Button>
      }
    >
      <View>
        {PRICE_ALERTS.map((alert) => (
          <PriceAlertRow key={alert.id} alert={alert} />
        ))}
      </View>
    </SectionCard>
  );

  const historyCard = (
    <SectionCard
      title="Histórico de avisos"
      description="Cada aviso de teto chega só uma vez por mês"
      titleSize={isTablet ? 20 : 18}
      gap={6}
    >
      <View>
        {NOTICE_HISTORY.map((item) => (
          <NoticeHistoryRow key={item.id} item={item} />
        ))}
      </View>
    </SectionCard>
  );

  return (
    <View className="flex-1">
      <Screen
        header={isTablet ? null : <TopBar title="Alertas" fallbackHref="/" />}
        contentClassName={isTablet ? 'pb-32' : undefined}
      >
        {isTablet ? (
          <>
            <PageHeader title="Alertas" subtitle={ALERTS_SUBTITLE} />
            <View className="flex-row gap-2.5">
              <Button
                variant="secondary"
                size="md"
                leftIcon="plus"
                className="px-4.5"
                onPress={newBudget}
              >
                Novo teto
              </Button>
              <Button
                variant="secondary"
                size="md"
                leftIcon="plus"
                className="px-4.5"
                onPress={newPriceAlert}
              >
                Novo alerta de preço
              </Button>
            </View>
            <ResponsiveGrid columns={{ tablet: 2 }}>
              {budgetsCard}
              {priceCard}
            </ResponsiveGrid>
          </>
        ) : (
          <>
            <View className="flex-row gap-2">
              <Button
                variant="secondary"
                size="md"
                leftIcon="plus"
                className="flex-1"
                onPress={newBudget}
              >
                Novo teto
              </Button>
              <Button
                variant="secondary"
                size="md"
                leftIcon="plus"
                className="flex-1"
                onPress={newPriceAlert}
              >
                Alerta de preço
              </Button>
            </View>
            {budgetsCard}
            {priceCard}
          </>
        )}
        {historyCard}
      </Screen>
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
