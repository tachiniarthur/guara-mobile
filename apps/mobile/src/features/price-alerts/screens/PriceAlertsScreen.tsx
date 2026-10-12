import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { EmptyState } from '@/components/feedback';
import { MataButton } from '@/components/illustrations';
import { PageHeader, Screen, SectionCard, TopBar } from '@/components/layout';
import { IconButton } from '@/components/ui';
import { routeTo } from '@/constants/routes';
// Straight to the files: the budgets and chat indexes pull in the navigation.
import { PlainRow } from '@/features/budgets/components/PlainRow';
import { AssistantNote } from '@/features/chat/components/AssistantNote';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ChatFab } from '@/navigation/ChatFab';

import { PriceAlertRow } from '../components';
import { usePriceAlerts } from '../hooks/usePriceAlerts';

const NEW_ALERT = '/new-price-alert';

const HOW_IT_WORKS = [
  {
    icon: 'arrowDown',
    title: 'Compra',
    caption: 'Avisa quando o preço cair até o valor escolhido',
  },
  { icon: 'arrowUp', title: 'Venda', caption: 'Avisa quando o preço subir até o valor escolhido' },
  { icon: 'retry', title: 'A cada cotação', caption: 'Conferimos sempre que a cotação atualiza' },
  {
    icon: 'pause',
    title: 'Um aviso só',
    caption: 'Depois de avisar, o alerta pausa até você decidir',
  },
] as const;

/** "Alertas de preço": every price alert, or the empty state with how they work. */
export function PriceAlertsScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { alerts } = usePriceAlerts();
  const create = () => router.navigate(NEW_ALERT);
  const count = `${alerts.length} ${alerts.length === 1 ? 'alerta' : 'alertas'}`;

  const howItWorks = (
    <SectionCard title="Como funcionam os alertas" titleSize={18} padding={22} gap={14}>
      <View>
        {HOW_IT_WORKS.map((row, index) => (
          <PlainRow key={row.title} {...row} last={index === HOW_IT_WORKS.length - 1} />
        ))}
      </View>
    </SectionCard>
  );

  const content = alerts.length ? (
    <>
      <SectionCard
        title="Seus alertas"
        description="Aviso por notificação e e-mail"
        titleSize={18}
        padding={22}
        gap={4}
      >
        <View>
          {alerts.map((alert, index) => (
            <PriceAlertRow
              key={alert.id}
              alert={alert}
              last={index === alerts.length - 1}
              onPress={() => router.navigate(routeTo.priceAlert(alert.id))}
            />
          ))}
        </View>
      </SectionCard>
      {howItWorks}
    </>
  ) : (
    <>
      <SectionCard padding={16}>
        <EmptyState
          icon="trendingUp"
          title="Nenhum alerta de preço"
          description="Escolha uma ação, FII, ETF ou cripto e o valor. Avisamos uma única vez quando o preço chegar lá."
          actions={<MataButton label="Criar alerta" size={44} onPress={create} />}
        />
      </SectionCard>
      <AssistantNote assistant="caramelo">
        É só dizer o ativo e o preço que eu fico de guarda. Funciona até para ativos que você ainda
        não tem.
      </AssistantNote>
      {howItWorks}
    </>
  );

  return (
    <View className="flex-1">
      <Screen
        header={
          isTablet ? null : (
            <TopBar
              title="Alertas de preço"
              fallbackHref="/alerts"
              actions={
                alerts.length ? (
                  <IconButton
                    icon="plus"
                    accessibilityLabel="Novo alerta de preço"
                    onPress={create}
                  />
                ) : undefined
              }
            />
          )
        }
        contentClassName={isTablet ? 'gap-5 pb-32' : 'gap-4 pt-1'}
      >
        {isTablet ? (
          <PageHeader
            title="Alertas de preço"
            subtitle={alerts.length ? count : 'Nenhum alerta criado'}
            breadcrumb={{
              parents: [{ label: 'Alertas', href: '/alerts' }],
              current: 'Alertas de preço',
            }}
            actions={
              alerts.length ? (
                <MataButton label="Novo alerta" icon="plus" size={44} onPress={create} />
              ) : undefined
            }
          />
        ) : null}
        {content}
      </Screen>
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
