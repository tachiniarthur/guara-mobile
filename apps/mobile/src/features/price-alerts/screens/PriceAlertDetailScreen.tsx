import { cents, EMPTY, formatCents, formatDate, todayISODate } from '@guara/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { TargetLineChart } from '@/components/charts';
import { EmptyState, toast } from '@/components/feedback';
import { PageHeader, ResponsiveGrid, Screen, SectionCard, TopBar } from '@/components/layout';
import { Badge, Button, ConfirmDialog, DataRow, Text } from '@/components/ui';
// Straight to the files: the budgets and chat indexes pull in the navigation.
import { PlainRow } from '@/features/budgets/components/PlainRow';
import { AssistantNote } from '@/features/chat/components/AssistantNote';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { haptics } from '@/lib/haptics';
import { ChatFab } from '@/navigation/ChatFab';

import { usePriceAlerts, type PriceAlertView } from '../hooks/usePriceAlerts';
import {
  SIDE_HINT,
  SIDE_LABEL,
  SIDE_WORD,
  STATUS_TEXT,
  carameloText,
  channelsPlace,
  channelsText,
  formatPrice,
  historyLabels,
  niceTicks,
  remainingText,
  tickLabel,
  typeText,
  whenText,
} from '../lib/price-alerts';
import { usePriceAlertsStore } from '../store';

function Tile({
  label,
  value,
  caption,
  tone,
}: {
  label: string;
  value: string;
  caption: string;
  tone?: 'brand';
}) {
  return (
    <View className="min-w-0 flex-1 gap-1 rounded-16 bg-surface-input px-4 py-3.5">
      <Text size={13} tone="subtle">
        {label}
      </Text>
      <Text serif weight="bold" size={19} tabular tone={tone}>
        {value}
      </Text>
      <Text size={12} tone="muted">
        {caption}
      </Text>
    </View>
  );
}

function AssetCard({ alert, today }: { alert: PriceAlertView; today: string }) {
  const { quote } = alert;
  const triggered = alert.status === 'triggered';
  const distance = remainingText(alert.side, quote.price, alert.targetPrice);
  return (
    <SectionCard padding={22} gap={16}>
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-14 border border-border bg-background">
          <Text serif weight="bold" size={20}>
            {quote.symbol}
          </Text>
        </View>
        <View className="min-w-0 flex-1">
          <Text size={20} weight="bold" leading={1.3}>
            {quote.name}
          </Text>
          <Text size={13} tone="muted" leading={1.3}>
            {`${quote.ticker} · cotação via Brapi`}
          </Text>
        </View>
        {triggered ? (
          <Badge label="Disparado" tone="positive" />
        ) : (
          <Badge
            label={SIDE_LABEL[alert.side]}
            tone={alert.side === 'sell' ? 'negative' : 'positive'}
          />
        )}
      </View>
      <ResponsiveGrid columns={{ phone: 1, tablet: 3 }} gap={10}>
        <Tile
          label="Preço-alvo"
          value={formatPrice(alert.targetPrice)}
          caption={SIDE_HINT[alert.side]}
        />
        {triggered && alert.triggeredPrice !== null && alert.triggeredAt ? (
          <Tile
            label="Cotação no aviso"
            value={formatPrice(alert.triggeredPrice)}
            caption={whenText(alert.triggeredAt, today).toLowerCase()}
          />
        ) : (
          <Tile
            label="Cotação agora"
            value={formatPrice(quote.price)}
            caption={`às ${formatDate(quote.quotedAt, 'HH:mm')}`}
          />
        )}
        <Tile
          label="Distância até o alvo"
          value={triggered ? 'atingido' : distance}
          caption={
            triggered ? EMPTY : formatPrice(cents(Math.abs(alert.targetPrice - quote.price)))
          }
          tone="brand"
        />
      </ResponsiveGrid>
    </SectionCard>
  );
}

/** Last 30 days against the target, with the period's low and high. */
function PriceHistory({
  alert,
  history,
}: {
  alert: PriceAlertView;
  history: NonNullable<PriceAlertView['quote']['history']>;
}) {
  const target = alert.targetPrice / 100;
  const low = Math.min(...history.values);
  const high = Math.max(...history.values);
  const ticks = niceTicks(Math.min(low, target), Math.max(high, target));
  const whole = (value: number) => formatCents(value * 100, { wholeUnits: true });
  return (
    <>
      <TargetLineChart
        values={history.values}
        minValue={ticks[0]!}
        maxValue={ticks.at(-1)!}
        ticks={ticks.map((value) => ({ value, label: tickLabel(value) }))}
        target={{ value: target, label: `alvo ${formatPrice(alert.targetPrice)}` }}
        xLabels={historyLabels(history.start, history.values.length)}
        accessibilityLabel={`${alert.quote.name} nos últimos 30 dias: mínima ${whole(low)}, máxima ${whole(high)}, agora ${formatPrice(alert.quote.price)}; linha do alvo em ${formatPrice(alert.targetPrice)}`}
      />
      <View className="flex-row gap-3.5">
        {[
          { label: 'Mínima em 30 dias', value: whole(low) },
          { label: 'Máxima em 30 dias', value: whole(high) },
        ].map((item) => (
          <View key={item.label} className="min-w-0 flex-1 gap-0.5">
            <Text size={13} tone="subtle">
              {item.label}
            </Text>
            <Text size={13} weight="semibold" tabular>
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}

/** "Alerta de preço": target, quote, the last 30 days, the alert's settings and its trigger. */
export function PriceAlertDetailScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { alertId } = useLocalSearchParams<{ alertId: string }>();
  const { alerts } = usePriceAlerts();
  const { update, cancel } = usePriceAlertsStore();
  const [confirming, setConfirming] = useState(false);
  const alert = alerts.find((item) => item.id === alertId);
  const today = todayISODate();

  if (!alert) {
    return (
      <Screen header={<TopBar title="Alerta de preço" fallbackHref="/alerts" />}>
        <EmptyState
          icon="bell"
          title="Alerta não encontrado"
          description={`Ele pode ter sido cancelado (${alertId}). Volte para os alertas.`}
          action={{ label: 'Ver alertas', onPress: () => router.replace('/alerts') }}
        />
      </Screen>
    );
  }

  const { quote } = alert;
  const triggered = alert.status === 'triggered';
  const paused = alert.status === 'paused';
  const edit = () =>
    router.navigate({ pathname: '/new-price-alert', params: { alertId: alert.id } });
  const togglePause = () => {
    haptics.selection();
    update(alert.id, { status: paused ? 'active' : 'paused' });
    toast.success(paused ? 'Alerta retomado' : 'Alerta pausado');
  };
  const confirmCancel = () => {
    setConfirming(false);
    haptics.success();
    if (router.canGoBack()) router.back();
    else router.replace('/alerts');
    cancel(alert.id);
    toast.success(`Alerta do ${quote.name} cancelado`);
  };

  const actions = (
    <View className="flex-row flex-wrap items-center gap-2">
      <Button variant="secondary" size="md" className="h-10 px-4.5" onPress={edit}>
        {triggered ? 'Renovar com outro alvo' : 'Editar'}
      </Button>
      {triggered ? null : (
        <Button variant="secondary" size="md" className="h-10 px-4.5" onPress={togglePause}>
          {paused ? 'Retomar' : 'Pausar'}
        </Button>
      )}
      <Button
        variant="negativeOutline"
        size="md"
        className="h-10 px-4.5"
        onPress={() => setConfirming(true)}
      >
        Cancelar alerta
      </Button>
    </View>
  );

  const history = quote.history;
  const chartCard = (
    <SectionCard
      title="Últimos 30 dias"
      description={history ? 'Linha verde: seu alvo' : undefined}
      titleSize={18}
      padding={22}
      gap={14}
    >
      {history ? (
        <PriceHistory alert={alert} history={history} />
      ) : (
        <Text size={14} tone="muted" leading={1.55}>
          {`Ainda não temos o histórico de 30 dias de ${quote.name}. A cotação de agora é ${formatPrice(quote.price)}, às ${formatDate(quote.quotedAt, 'HH:mm')}.`}
        </Text>
      )}
    </SectionCard>
  );

  const aboutCard = (
    <SectionCard title="Sobre o alerta" titleSize={18} padding={22} gap={14}>
      <View>
        <DataRow label="Tipo" value={typeText(alert.side)} />
        <DataRow label="Criado em" value={alert.createdAt ? formatDate(alert.createdAt) : EMPTY} />
        <DataRow label="Onde avisa" value={channelsText(alert.channels)} />
        <DataRow label="Situação" value={STATUS_TEXT[alert.status]} last />
      </View>
    </SectionCard>
  );

  const triggersCard = (
    <SectionCard title="Disparos" titleSize={18} padding={22} gap={14}>
      {triggered && alert.triggeredAt && alert.triggeredPrice !== null ? (
        <PlainRow
          title={whenText(alert.triggeredAt, today)}
          caption={`${formatPrice(alert.triggeredPrice)} · avisado ${channelsPlace(alert.channels)}`}
          trailing={<Badge label="Disparado" tone="positive" />}
          last
        />
      ) : (
        <Text size={14} tone="muted" leading={1.55}>
          Ainda não disparou. Quando o preço chegar ao alvo, avisamos uma única vez e o alerta pausa
          até você decidir.
        </Text>
      )}
    </SectionCard>
  );

  const note = <AssistantNote assistant="caramelo">{carameloText(alert, quote)}</AssistantNote>;
  const subtitle = `${quote.name} · ${SIDE_WORD[alert.side]}`;

  return (
    <View className="flex-1">
      <Screen
        header={
          isTablet ? null : (
            <TopBar title="Alerta de preço" subtitle={subtitle} fallbackHref="/alerts" />
          )
        }
        contentClassName={isTablet ? 'gap-5 pb-32' : 'gap-4 pt-1'}
      >
        {isTablet ? (
          <PageHeader
            title={`Alerta do ${quote.name}`}
            subtitle={`${SIDE_WORD[alert.side].charAt(0).toUpperCase()}${SIDE_WORD[alert.side].slice(1)} · alvo de ${formatPrice(alert.targetPrice)}`}
            breadcrumb={{
              parents: [{ label: 'Alertas', href: '/alerts' }],
              current: quote.name,
            }}
            actions={actions}
          />
        ) : null}
        {triggered ? note : null}
        <AssetCard alert={alert} today={today} />
        {isTablet ? null : actions}
        {chartCard}
        {isTablet ? (
          <ResponsiveGrid>
            {aboutCard}
            {triggersCard}
          </ResponsiveGrid>
        ) : (
          <>
            {aboutCard}
            {triggersCard}
          </>
        )}
        {triggered ? null : note}
      </Screen>
      {isTablet ? <ChatFab /> : null}
      <ConfirmDialog
        open={confirming}
        title={`Cancelar o alerta do ${quote.name}?`}
        message={`O Guará para de acompanhar o ${quote.name} para este alvo. Você pode criar outro alerta quando quiser.`}
        confirmLabel="Cancelar alerta"
        cancelLabel="Manter"
        destructive
        onConfirm={confirmCancel}
        onCancel={() => setConfirming(false)}
      />
    </View>
  );
}
