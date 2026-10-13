import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { EmptyState, ScreenStates, lastUpdateLabel, useScreenStatus } from '@/components/feedback';
import { PageHeader, ResponsiveGrid, Screen, SectionCard, TopBar } from '@/components/layout';
import { Button, Chip, Text } from '@/components/ui';
import { routeTo } from '@/constants/routes';
// Straight to the hook: the budgets index pulls in screens that open the chat.
import { useBudgets } from '@/features/budgets/hooks/useBudgets';
// Straight to the files: the price-alerts index pulls in screens that open the chat.
import { PriceAlertRow } from '@/features/price-alerts/components/PriceAlertRow';
import { usePriceAlerts } from '@/features/price-alerts/hooks/usePriceAlerts';
import { MonthBudgetRow } from '@/features/spending';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ChatFab } from '@/navigation';

import { NoticeHistoryRow } from '../components';
import { NOTICE_HISTORY } from '../data';

type AlertFilter = 'all' | 'budgets' | 'price' | 'paused';

const ALERT_FILTERS: { value: AlertFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'budgets', label: 'Tetos' },
  { value: 'price', label: 'Preço' },
  { value: 'paused', label: 'Pausados' },
];

/** When the caps and prices were last checked (shown while offline). */
const ALERTS_CHECKED_AT = '2026-09-23T17:30:00.000Z';

/** Alertas: spending caps, price alerts and the notices already sent. */
export function AlertsScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { budgets } = useBudgets();
  const { alerts } = usePriceAlerts();
  const newBudget = () => router.navigate('/new-budget');
  const subtitle = `${budgets.length} ${budgets.length === 1 ? 'teto' : 'tetos'} e ${alerts.length} ${alerts.length === 1 ? 'alerta' : 'alertas'} de preço`;
  const newPriceAlert = () => router.navigate('/new-price-alert');
  const [filter, setFilter] = useState<AlertFilter>('all');
  // "Pausados": price alerts paused by the user or after they fired.
  const shownAlerts =
    filter === 'paused' ? alerts.filter((alert) => alert.status !== 'active') : alerts;
  // Static data today: the API adds loading and error.
  const status = useScreenStatus(budgets.length + alerts.length === 0 ? 'empty' : 'ready');

  const budgetsCard = (
    <SectionCard
      title="Tetos do mês"
      description="Cada aviso chega uma vez por mês, somando crédito e débito"
      onTitlePress={() => router.navigate('/budgets')}
      titleSize={isTablet ? 20 : 18}
      padding={isTablet ? 20 : 16}
      gap={isTablet ? 20 : 14}
      className="flex-1"
    >
      {budgets.length ? (
        <View className="gap-5.5">
          {budgets.map((budget) => (
            <MonthBudgetRow
              key={budget.id}
              category={budget.label}
              spent={budget.spent}
              limit={budget.limit}
              milestones={budget.warnings}
              onPress={() => router.navigate(routeTo.budget(budget.id))}
            />
          ))}
        </View>
      ) : (
        <Text size={14} tone="muted" leading={1.55}>
          Nenhum teto ainda. Um teto avisa antes de você passar do limite de uma categoria.
        </Text>
      )}
    </SectionCard>
  );

  const priceCard = (
    <SectionCard
      title="Alertas de preço"
      description="Aviso por notificação e e-mail"
      onTitlePress={() => router.navigate('/price-alerts')}
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
      {shownAlerts.length ? (
        <View>
          {shownAlerts.map((alert, index) => (
            <PriceAlertRow
              key={alert.id}
              alert={alert}
              last={index === shownAlerts.length - 1}
              onPress={() => router.navigate(routeTo.priceAlert(alert.id))}
            />
          ))}
        </View>
      ) : (
        <Text size={14} tone="muted" leading={1.55}>
          Nenhum alerta de preço. Avisamos uma única vez quando o preço chegar ao valor escolhido.
        </Text>
      )}
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
            <PageHeader title="Alertas" subtitle={subtitle} />
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
          </>
        ) : (
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
        )}
        <ScreenStates
          status={status}
          errorTitle="Não deu para carregar seus alertas"
          onRetry={() => undefined}
          empty={
            <SectionCard padding={16}>
              <EmptyState
                icon="bell"
                title="Nenhum alerta ainda"
                description="Crie um teto para uma categoria de gasto ou um alerta de preço para uma ação, FII, ETF ou cripto."
                actions={
                  <>
                    <Button size="md" onPress={newBudget}>
                      Novo teto
                    </Button>
                    <Button variant="secondary" size="md" onPress={newPriceAlert}>
                      Novo alerta de preço
                    </Button>
                  </>
                }
              />
            </SectionCard>
          }
          offline={{
            since: lastUpdateLabel(ALERTS_CHECKED_AT),
            paused:
              'Os tetos e os preços continuam sendo conferidos no servidor. Os avisos chegam assim que a conexão voltar.',
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            accessibilityLabel="Filtrar alertas"
            contentContainerClassName="gap-2"
          >
            {ALERT_FILTERS.map((item) => (
              <Chip
                key={item.value}
                label={item.label}
                textSize={14}
                selected={filter === item.value}
                onPress={() => setFilter(item.value)}
              />
            ))}
          </ScrollView>
          {filter === 'paused' && shownAlerts.length === 0 ? (
            <SectionCard padding={16}>
              <EmptyState
                icon="pause"
                title="Nenhum alerta pausado"
                description="Alertas de preço pausam depois de avisar. Todos os seus estão ativos."
                action={{
                  label: 'Limpar filtros',
                  variant: 'secondary',
                  onPress: () => setFilter('all'),
                }}
              />
            </SectionCard>
          ) : filter === 'budgets' ? (
            budgetsCard
          ) : filter === 'all' && isTablet ? (
            <ResponsiveGrid columns={{ tablet: 2 }}>
              {budgetsCard}
              {priceCard}
            </ResponsiveGrid>
          ) : filter === 'all' ? (
            <>
              {budgetsCard}
              {priceCard}
            </>
          ) : (
            priceCard
          )}
          {filter === 'all' ? historyCard : null}
        </ScreenStates>
      </Screen>
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
