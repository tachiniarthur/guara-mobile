import { colors } from '@guara/ui-tokens';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { LegendSwatch, ProjectionChart } from '@/components/charts';
import { EmptyState, toast } from '@/components/feedback';
import { ResponsiveGrid } from '@/components/layout';
import { Button, Span, Text } from '@/components/ui';
import { AskAssistantCard } from '@/features/chat';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { conversationHref } from '@/navigation';

import {
  ChipField,
  FigureRows,
  Insight,
  MilestoneList,
  PremisesCard,
  ResultCard,
  SavedNotice,
  SimCard,
  SimulatorFrame,
  SliderField,
} from '../components';
import {
  CUT_CATEGORIES,
  CUT_DEFAULTS,
  CUT_DESTINATIONS,
  GOAL_DEFAULTS,
  GOAL_PLACES,
  HOUSEHOLD,
  OTHER_CUTS,
  OTHER_CUTS_TOTAL,
  QUESTIONS,
  RESERVE,
  RETIREMENT_DEFAULTS,
} from '../data';
import { useSavedPremises } from '../hooks/useSavedPremises';
import { simulateCut } from '../lib/cut';
import { reais, signedReais, thousands, yearlyPercent } from '../lib/format';
import { simulateGoal } from '../lib/goal';
import { simulateRetirement } from '../lib/retirement';
import { useSimulationsStore } from '../store';

type Category = (typeof CUT_CATEGORIES)[number]['key'];
type Destination = (typeof CUT_DESTINATIONS)[number]['key'];

const RETIREMENT = simulateRetirement({ ...RETIREMENT_DEFAULTS, start: HOUSEHOLD.invested });
const GOAL_INPUT = { ...GOAL_DEFAULTS, rate: GOAL_PLACES[0].monthlyRate };

/** Simulador · Cortar um gasto: what a cut becomes when invested (Tamanduá). */
export function CutExpenseSimulationScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const opened = useSavedPremises('cut');
  const initial = opened?.input ?? CUT_DEFAULTS;
  const saveSimulation = useSimulationsStore((state) => state.save);
  const [category, setCategory] = useState<Category>(initial.category);
  const [percent, setPercent] = useState<number>(initial.percent);
  const [rate, setRate] = useState<number>(initial.rate);
  const [destination, setDestination] = useState<Destination>(initial.destination);
  const notice = opened ? <SavedNotice simulation={opened.simulation} /> : null;

  const info = CUT_CATEGORIES.find((item) => item.key === category) ?? CUT_CATEGORIES[0];
  const result = simulateCut({ average: info.average, percent, rate });
  const trip = simulateGoal(GOAL_INPUT, HOUSEHOLD.surplus, result?.savings ?? 0);
  const tripWithCut = trip.alternatives[1];
  const gap = Math.max(0, RETIREMENT.budget.gap);

  const premises = (
    <PremisesCard
      summary={[
        { label: 'Teto novo', value: result ? `${reais(result.cap)}/mês` : '—' },
        { label: 'Economia', value: result ? `${reais(result.savings)}/mês` : '—' },
        { label: 'Começa em', value: 'outubro' },
      ]}
    >
      <ChipField
        label="Gasto para cortar"
        options={CUT_CATEGORIES}
        isSelected={(key) => key === category}
        onPress={setCategory}
      />
      <Insight icon="target" color={colors.chart.out}>
        {info.average === null ? (
          `Ainda não temos o histórico de ${info.name} para calcular a média.`
        ) : (
          <>
            Você gastou em média <Span weight="bold">{reais(info.average)} por mês</Span> com{' '}
            {info.name} nos últimos 3 meses.
          </>
        )}
      </Insight>
      <SliderField
        label="Quanto cortar"
        display={`${percent}%`}
        caption={
          result
            ? `Fica um teto de ${reais(result.cap)} por mês para emergências`
            : 'Sem média para calcular o teto'
        }
        value={percent}
        min={10}
        max={100}
        step={5}
        onChange={setPercent}
      />
      <SliderField
        label="Rendimento da economia"
        display={yearlyPercent(rate)}
        caption={`Acima da inflação · perfil ${HOUSEHOLD.profile}`}
        value={rate}
        min={1}
        max={7.5}
        step={0.1}
        onChange={setRate}
      />
      <ChipField
        label="Para onde vai a economia"
        options={CUT_DESTINATIONS}
        isSelected={(key) => key === destination}
        onPress={setDestination}
      />
    </PremisesCard>
  );

  if (!result) {
    return (
      <SimulatorFrame active="cut" notice={notice}>
        <EmptyState
          icon="scissors"
          title="Sem histórico desse gasto"
          description="Quando tivermos 3 meses de lançamentos, o Tamanduá mostra quanto esse corte vira."
        />
        {premises}
      </SimulatorFrame>
    );
  }

  const blocks = {
    horizons: (
      <SimCard title="Quanto vira com o tempo" description="Investindo a economia todo mês">
        <FigureRows
          items={result.horizons.map((item) => ({
            key: String(item.years),
            title: `Em ${item.years} ${item.years === 1 ? 'ano' : 'anos'}`,
            caption: `guardado ${thousands(item.saved)}`,
            value: thousands(item.value),
            tone: 'positive',
          }))}
        />
      </SimCard>
    ),
    goals: (
      <SimCard title="Efeito nas suas metas" description="Se a economia for para cada uma">
        <FigureRows
          items={[
            {
              key: 'retirement',
              title: 'Aposentadoria',
              caption: `o que falta por mês cai de ${reais(gap)} para ${reais(Math.max(0, gap - result.savings))}`,
              value: signedReais(-result.savings),
              tone: 'positive',
            },
            {
              key: 'trip',
              title: GOAL_DEFAULTS.name,
              caption: `somando ${reais(result.savings)} ao plano de ${reais(trip.deposit)}`,
              value: tripWithCut?.months == null ? '—' : `${tripWithCut.months} meses`,
              tone: 'positive',
            },
            {
              key: 'reserve',
              title: 'Reserva de emergência',
              caption: `faltam ${reais(RESERVE.target - RESERVE.saved)} para completar`,
              value: result.reserveMonths === null ? '—' : `${result.reserveMonths} meses`,
              tone: 'info',
            },
          ]}
        />
      </SimCard>
    ),
  };

  return (
    <SimulatorFrame active="cut" notice={notice}>
      <ResultCard
        title="O que esse corte vira"
        subtitle="Economia investida todo mês, em valores de hoje"
        label="Economia por mês"
        value={reais(result.savings)}
        caption={
          <Text size={14} tone="muted">
            <Span weight="bold" tone="default">
              {reais(result.yearly)}
            </Span>{' '}
            por ano · {thousands(result.tenYears)} em 10 anos
          </Text>
        }
        chart={
          <ProjectionChart
            values={result.points.map((point) => point.value)}
            contributed={result.points.map((point) => point.contributed)}
            xLabels={['hoje', '2 anos', '4 anos', '6 anos', '8 anos', '10 anos']}
            color={colors.positive.DEFAULT}
            describePoint={(index) =>
              `${index === 0 ? 'Hoje' : `Em ${index} ${index === 1 ? 'ano' : 'anos'}`}: ${thousands(result.points[index]?.value ?? 0)}`
            }
            wide={isTablet}
            accessibilityLabel={`Economia de ${reais(result.savings)} por mês investida por 10 anos, chegando a cerca de ${thousands(result.tenYears)}.`}
          />
        }
        legend={
          <View className="flex-row flex-wrap gap-x-4.5 gap-y-2">
            <LegendSwatch
              label="Economia investida"
              color={colors.positive.DEFAULT}
              width={18}
              size={13}
            />
            <LegendSwatch label="Só a economia, sem rendimento" dashed width={18} size={13} />
          </View>
        }
        scenarios={result.scenarios.map((scenario) => ({
          key: scenario.key,
          label: scenario.label,
          caption: `${scenario.percent}% · ${reais(scenario.cap)} de teto`,
          value: reais(scenario.savings),
          selected: scenario.key === 'yours',
          onPress: () => setPercent(scenario.percent),
        }))}
        actions={
          <>
            <Button
              variant="inverse"
              size="md"
              leftIcon="flag"
              className="px-4.5"
              onPress={() => router.navigate('/new-budget')}
            >
              {`Criar teto de ${reais(result.cap)}`}
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="px-4.5"
              onPress={() => {
                saveSimulation(`Cortar ${info.name}`, {
                  kind: 'cut',
                  category,
                  percent,
                  rate,
                  destination,
                });
                toast.success('Simulação salva');
              }}
            >
              Salvar
            </Button>
            <Button
              variant="ghost"
              size="md"
              leftIcon="message"
              className="px-4.5"
              onPress={() =>
                router.navigate(conversationHref(undefined, { assistant: 'tamandua' }))
              }
            >
              Conversar com Tamanduá
            </Button>
          </>
        }
        footnote="O teto avisa quando você chegar perto do limite. Simulação educativa."
        wide={isTablet}
      />
      {premises}
      {isTablet ? (
        <ResponsiveGrid columns={{ tablet: 2 }} gap={16} stretch>
          {blocks.horizons}
          {blocks.goals}
        </ResponsiveGrid>
      ) : (
        <>
          {blocks.horizons}
          {blocks.goals}
        </>
      )}
      <SimCard title="Outros cortes possíveis" description="O Tamanduá encontrou nos seus gastos">
        <FigureRows
          items={OTHER_CUTS.map((item) => ({ key: item.title, ...item, tone: 'positive' }))}
        />
        <Insight icon="scissors" color={colors.positive.DEFAULT}>
          Somando tudo, dá para liberar até <Span weight="bold">{OTHER_CUTS_TOTAL}</Span> sem mexer
          em moradia e mercado.
        </Insight>
      </SimCard>
      <SimCard title="Como vai funcionar" description="Depois de salvar o corte">
        <MilestoneList
          dateWidth={84}
          color={colors.positive.DEFAULT}
          items={[
            {
              key: 'today',
              date: 'Hoje',
              title: `Teto de ${reais(result.cap)} para ${info.name}`,
              caption: `avisos em ${reais(result.alerts[0] ?? 0)} e ${reais(result.alerts[1] ?? 0)}`,
              filled: true,
            },
            {
              key: 'monthly',
              date: 'Todo mês',
              title: `${reais(result.savings)} separados no dia 5`,
              caption: 'junto com o salário',
            },
            {
              key: 'over',
              date: 'Se passar',
              title: 'O Quero-quero confirma com você',
              caption: 'nada é bloqueado',
            },
          ]}
        />
      </SimCard>
      <AskAssistantCard
        assistant="tamandua"
        subject="sobre esta simulação"
        questions={QUESTIONS.cut}
      />
    </SimulatorFrame>
  );
}
