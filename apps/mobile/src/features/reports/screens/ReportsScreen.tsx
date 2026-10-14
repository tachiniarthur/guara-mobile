import { colors } from '@guara/ui-tokens';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { BalanceLineChart, GroupedBarChart, LegendSwatch } from '@/components/charts';
import { ScreenStates, StateMessage, toast, useScreenStatus } from '@/components/feedback';
import { PageHeader, ResponsiveGrid, Screen, SectionCard, TopBar } from '@/components/layout';
import { Button, IconButton, LinkButton, MoneyText, Span, Text } from '@/components/ui';
import { useChatStore, type ChatContext } from '@/features/chat';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useChatDocked } from '@/hooks/useChatDocked';
import { ChatFab, conversationHref } from '@/navigation';
import { useScreenPreview } from '@/stores/screen-preview';

import {
  ExportMenu,
  InsightPanel,
  MonthComparison,
  PeriodChips,
  ReportSummaryCard,
  Timeline,
} from '../components';
import { BALANCE, REPORT, REPORT_CHAT, TIMELINE, WEEKS, type ReportPeriod } from '../data';

/** The chat panel reads the report with the user ("Tamanduá · Lendo este relatório com você"). */
const REPORT_CONTEXT: ChatContext = {
  assistant: 'tamandua',
  subtitle: 'Lendo este relatório com você',
  intro: REPORT_CHAT.intro,
  question: REPORT_CHAT.question,
  suggestions: REPORT_CHAT.suggestions,
  placeholder: 'Pergunte sobre este relatório',
};

const decimal = (value: number) =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function Dot({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className="h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: color }} />
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </View>
  );
}

/** Relatório: what happened with the money in the period. */
export function ReportsScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const docked = useChatDocked();
  const [period, setPeriod] = useState<ReportPeriod>('month');
  // Static data today: the API adds loading, error and periods without movements.
  const status = useScreenStatus('ready');
  const setPreview = useScreenPreview((state) => state.setPreview);
  const panelOpen = useChatStore((state) => state.panelOpen);
  const setContext = useChatStore((state) => state.setContext);

  // Wide tablets: the side panel (same as every page) talks about this report while it is open.
  useEffect(() => {
    if (!docked) return;
    setContext(REPORT_CONTEXT);
    return () => setContext(null);
  }, [docked, setContext]);

  const askTamandua = () =>
    docked
      ? setContext(REPORT_CONTEXT)
      : router.navigate(conversationHref(undefined, { assistant: 'tamandua' }));

  const balancePanel = (
    <InsightPanel
      title="Saldo dia a dia"
      description="Sobe com o que entra e desce com o que sai"
      stats={[
        {
          label: 'Começou o mês',
          value: <MoneyText value={BALANCE.start} size={18} weight="bold" />,
        },
        { label: 'Hoje', value: <MoneyText value={BALANCE.today} size={18} weight="bold" /> },
        {
          label: 'Previsão dia 30',
          value: (
            <Text size={18} weight="bold" tone="info" tabular>
              {BALANCE.forecastLabel}
            </Text>
          ),
        },
      ]}
      chart={
        <BalanceLineChart
          values={BALANCE.values}
          projection={BALANCE.projection}
          daysInPeriod={30}
          minValue={8000}
          maxValue={16000}
          ticks={[
            { value: 8000, label: '8 mil' },
            { value: 12000, label: '12 mil' },
            { value: 16000, label: '16 mil' },
          ]}
          markers={BALANCE.markers}
          describeDay={(day) =>
            `Dia ${day}: R$ ${BALANCE.values[day - 1]?.toLocaleString('pt-BR')}`
          }
          accessibilityLabel={BALANCE.accessibilityLabel}
        />
      }
      legend={
        <>
          <LegendSwatch label="Saldo" color={colors.info.DEFAULT} width={18} />
          <LegendSwatch
            label="Projeção até o dia 30"
            dashed
            color={colors.info.DEFAULT}
            width={18}
          />
          <Dot color={colors.info.DEFAULT} label="Maiores entradas" />
          <Dot color={colors.negative.DEFAULT} label="Maior saída" />
        </>
      }
      footnote={
        <>
          O saldo deve fechar{' '}
          <Span weight="bold" tone="default">
            R$ 1.707 acima
          </Span>{' '}
          do começo do mês.
        </>
      }
    />
  );

  const weeksPanel = (
    <InsightPanel
      title="Entradas e saídas por semana"
      description={
        isTablet
          ? 'Quanto entrou e saiu em cada semana de setembro'
          : 'Em R$ mil, por semana de setembro'
      }
      stats={[
        {
          label: 'Entrou',
          value: <MoneyText value={REPORT.totals.in} size={18} weight="bold" tone="info" />,
        },
        {
          label: 'Saiu',
          value: <MoneyText value={REPORT.totals.out} size={18} weight="bold" tone="negative" />,
        },
        {
          label: 'Semana mais cara',
          value: (
            <Text size={18} weight="bold" tabular>
              {WEEKS.priciest}
            </Text>
          ),
        },
      ]}
      chart={
        <GroupedBarChart
          data={WEEKS.data}
          series={[{ color: colors.info.DEFAULT }, { color: colors.negative.DEFAULT }]}
          maxValue={8}
          ticks={[0, 4, 8]}
          format={decimal}
          accessibilityLabel={WEEKS.accessibilityLabel}
        />
      }
      legend={
        <>
          <LegendSwatch label="Entradas" color={colors.info.DEFAULT} shape="dot" />
          <LegendSwatch label="Saídas" color={colors.negative.DEFAULT} shape="dot" />
          <Text variant="caption" tone="subtle">
            *semana em andamento
          </Text>
        </>
      }
      footnote={
        <>
          A última semana já soma{' '}
          <Span weight="bold" tone="default">
            R$ 1.772
          </Span>{' '}
          em dois dias, por causa da compra de eletrônicos.
        </>
      }
    />
  );

  const timelineCard = (
    <SectionCard
      title="Linha do tempo"
      description={
        isTablet
          ? 'Os movimentos que mais mexeram no seu saldo'
          : 'Os movimentos que mais mexeram no saldo'
      }
      gap={6}
      className="flex-1"
      action={
        <LinkButton
          label={isTablet ? 'Ver 118 lançamentos' : 'Todos'}
          className="min-h-6"
          onPress={() => router.navigate('/reports/timeline')}
        />
      }
    >
      <Timeline events={TIMELINE} dateWidth={isTablet ? 56 : 48} />
    </SectionCard>
  );

  const comparisonCard = (
    <SectionCard title="Comparado com agosto" gap={6} className="flex-1">
      <MonthComparison />
    </SectionCard>
  );

  const content = (
    <Screen
      header={
        isTablet ? null : (
          <TopBar
            title="Relatório"
            subtitle={REPORT.periodLabel}
            fallbackHref="/"
            actions={
              <>
                <ExportMenu variant="icon" />
                <IconButton
                  icon="message"
                  accessibilityLabel="Perguntar ao Tamanduá sobre o relatório"
                  onPress={askTamandua}
                />
              </>
            }
          />
        )
      }
      contentClassName={isTablet ? 'pb-32' : undefined}
    >
      {isTablet ? (
        <>
          <PageHeader
            title={REPORT.title}
            subtitle={REPORT.scopeLabel}
            actions={
              docked && panelOpen ? null : (
                <IconButton
                  icon="message"
                  variant="outline"
                  accessibilityLabel="Perguntar ao Tamanduá sobre o relatório"
                  onPress={askTamandua}
                />
              )
            }
          />
          <View className="flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-1">
              <PeriodChips
                value={period}
                onChange={setPeriod}
                onCustom={() => toast.info('Escolha as datas no calendário')}
              />
            </View>
            <ExportMenu />
          </View>
        </>
      ) : (
        <>
          <PeriodChips
            value={period}
            onChange={setPeriod}
            onCustom={() => toast.info('Escolha as datas no calendário')}
          />
          <ExportMenu fullWidth />
        </>
      )}
      <ScreenStates status={status} onRetry={() => undefined} since={REPORT.syncedAt}>
        <ReportSummaryCard />
        <SectionCard
          title="Como o saldo andou"
          description={REPORT.scopeLabel}
          padding={isTablet ? 20 : 16}
          gap={16}
          empty={
            <StateMessage
              icon="document"
              title="Sem movimentos no período"
              description="Não há entradas nem saídas nesse período nos bancos conectados. Escolha outro período."
              action={
                <Button
                  variant="secondary"
                  size="md"
                  onPress={() => {
                    setPreview('auto');
                    setPeriod('month');
                  }}
                >
                  Mudar período
                </Button>
              }
            />
          }
        >
          <ResponsiveGrid columns={{ phone: 1, tablet: 1 }}>
            {balancePanel}
            {weeksPanel}
          </ResponsiveGrid>
        </SectionCard>
        {isTablet ? (
          <ResponsiveGrid columns={{ tablet: 2 }}>
            {timelineCard}
            {comparisonCard}
          </ResponsiveGrid>
        ) : (
          <>
            {timelineCard}
            {comparisonCard}
          </>
        )}
      </ScreenStates>
    </Screen>
  );

  return (
    <View className="flex-1">
      {content}
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
