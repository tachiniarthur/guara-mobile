import type { Cents } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { cents } from '@guara/utils';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { LegendSwatch, ProjectionChart } from '@/components/charts';
import { toast } from '@/components/feedback';
import { ResponsiveGrid } from '@/components/layout';
import { Button, Input, MoneyInput, Span, Text } from '@/components/ui';
import { AskAssistantCard } from '@/features/chat';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { conversationHref } from '@/navigation';

import {
  ChipField,
  Composition,
  FigureRows,
  Insight,
  MilestoneList,
  PremisesCard,
  ResultCard,
  SimCard,
  SimulatorFrame,
  SliderField,
} from '../components';
import {
  CUT_CATEGORIES,
  CUT_DEFAULTS,
  GOAL_DEFAULTS,
  GOAL_PLACES,
  HOUSEHOLD,
  QUESTIONS,
  RESERVE,
  RETIREMENT_DEFAULTS,
  START,
} from '../data';
import { simulateCut } from '../lib/cut';
import { longMonth, reais, shortMonth, thousands } from '../lib/format';
import { simulateGoal } from '../lib/goal';
import { simulateRetirement } from '../lib/retirement';

type Place = (typeof GOAL_PLACES)[number]['key'];

/** Savings of the default ride-hailing cut ("somando a economia do corte de app"). */
const CUT_SAVINGS =
  simulateCut({
    average: CUT_CATEGORIES[0].average,
    percent: CUT_DEFAULTS.percent,
    rate: CUT_DEFAULTS.rate,
  })?.savings ?? 0;
const RETIREMENT_DEPOSIT = simulateRetirement({
  ...RETIREMENT_DEFAULTS,
  start: HOUSEHOLD.invested,
}).deposit;

/** Simulador · Objetivo: how much to save per month to pay for a goal (Onça). */
export function GoalSimulationScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const [name, setName] = useState<string>(GOAL_DEFAULTS.name);
  const [cost, setCost] = useState<number>(GOAL_DEFAULTS.cost);
  const [months, setMonths] = useState<number>(GOAL_DEFAULTS.months);
  const [saved, setSaved] = useState<Cents | null>(cents(GOAL_DEFAULTS.saved * 100));
  const [place, setPlace] = useState<Place>(GOAL_DEFAULTS.place);

  const placeInfo = GOAL_PLACES.find((item) => item.key === place) ?? GOAL_PLACES[0];
  const start = (saved ?? 0) / 100;
  const result = simulateGoal(
    { cost, months, saved: start, rate: placeInfo.monthlyRate },
    HOUSEHOLD.surplus,
    CUT_SAVINGS,
  );
  const goalName = name.trim() || 'Seu objetivo';
  // The design talks about "a viagem"; other goals read "o objetivo".
  const isTrip = goalName.toLowerCase().startsWith('viagem');
  const the = isTrip ? 'a viagem' : 'o objetivo';
  const total = result.composition.saved + result.composition.deposits + result.composition.yield;
  const yieldShare = total > 0 ? Math.round((result.composition.yield / total) * 100) : 0;

  const milestones = result.milestones.map((step) => ({
    key: String(step.percent),
    date: step.month === null ? '—' : shortMonth(START, step.month),
    title:
      step.percent === 100
        ? `Meta · ${reais(step.value)}`
        : `${step.percent}% · ${reais(step.value)}`,
    caption:
      step.percent === 100
        ? isTrip
          ? 'hora de reservar as passagens'
          : 'meta alcançada'
        : 'a Onça avisa quando chegar',
  }));

  const blocks = {
    milestones: (
      <SimCard title="Marcos do caminho" description="Quando você chega em cada etapa">
        <MilestoneList items={milestones} color={colors.positive.DEFAULT} />
      </SimCard>
    ),
    composition: (
      <SimCard title="De onde vem o dinheiro" description={`Em ${longMonth(START, months)}`}>
        <Composition
          parts={[
            {
              label: 'Já guardado',
              value: result.composition.saved,
              display: thousands(result.composition.saved),
              color: colors.chart.inMuted,
            },
            {
              label: 'Seus depósitos',
              value: result.composition.deposits,
              display: thousands(result.composition.deposits),
              color: colors.foreground.subtle,
            },
            {
              label: 'Rendimento',
              value: Math.max(0, result.composition.yield),
              display: thousands(Math.max(0, result.composition.yield)),
              color: colors.positive.DEFAULT,
            },
          ]}
        />
        <Insight icon="target" color={colors.positive.DEFAULT}>
          O rendimento paga cerca de <Span weight="bold">{yieldShare}%</Span>{' '}
          {isTrip ? 'da viagem' : 'do objetivo'}. Guardar na conta corrente não renderia nada.
        </Insight>
      </SimCard>
    ),
  };

  return (
    <SimulatorFrame active="goal">
      <ResultCard
        title={`Seu plano para ${the}`}
        subtitle={`Meta de ${reais(cost)} em ${months} meses`}
        label="Guardar por mês"
        value={reais(result.deposit)}
        caption={
          <Text size={14} tone="muted">
            Equivale a{' '}
            <Span weight="bold" tone="default">
              {Math.round(result.surplusShare)}%
            </Span>{' '}
            do que sobrou em setembro · acompanhado pela Onça
          </Text>
        }
        chart={
          <ProjectionChart
            values={result.points.map((point) => point.value)}
            contributed={result.points.map((point) => point.contributed)}
            goal={{ value: cost, label: `Meta ${reais(cost)}` }}
            xLabels={Array.from({ length: 4 }, (_, index) =>
              shortMonth(START, Math.round((months * index) / 3)),
            )}
            color={colors.positive.DEFAULT}
            describePoint={(index) =>
              `${shortMonth(START, index)}: ${reais(result.points[index]?.value ?? 0)}`
            }
            wide={isTablet}
            accessibilityLabel={`Dinheiro guardado mês a mês até ${longMonth(START, months)}, chegando a ${thousands(result.final)}.`}
          />
        }
        legend={
          <View className="flex-row flex-wrap gap-x-4.5 gap-y-2">
            <LegendSwatch
              label="Guardado com rendimento"
              color={colors.positive.DEFAULT}
              width={18}
              size={13}
            />
            <LegendSwatch label="Só o que você guardou" dashed width={18} size={13} />
            <LegendSwatch label="Meta" dashed color={colors.brand.DEFAULT} width={18} size={13} />
          </View>
        }
        scenarios={result.scenarios.map((scenario) => ({
          key: scenario.key,
          label: scenario.label,
          caption: `${scenario.months} meses`,
          value: reais(scenario.deposit),
          selected: scenario.key === 'plan',
          onPress: () => setMonths(scenario.months),
        }))}
        actions={
          <>
            <Button
              variant="inverse"
              size="md"
              leftIcon="flag"
              className="px-4.5"
              onPress={() => router.navigate('/new-goal')}
            >
              Transformar em meta
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="px-4.5"
              onPress={() => toast.success('Simulação salva')}
            >
              Salvar
            </Button>
            <Button
              variant="ghost"
              size="md"
              leftIcon="message"
              className="px-4.5"
              onPress={() => router.navigate(conversationHref(undefined, { assistant: 'onca' }))}
            >
              Conversar com Onça
            </Button>
          </>
        }
        footnote="Simulação educativa. Rendimentos podem variar."
        wide={isTablet}
      />
      <PremisesCard
        summary={[
          { label: 'Falta juntar', value: reais(Math.max(0, cost - start)) },
          { label: 'Depósitos', value: `${months} de ${reais(result.deposit)}` },
          { label: 'Primeiro depósito', value: '5 de outubro, com o salário' },
        ]}
      >
        <Input label="Objetivo" value={name} onChangeText={setName} />
        <SliderField
          label="Quanto custa"
          display={reais(cost)}
          caption="Passagens, hospedagem e passeios para 2 pessoas"
          value={cost}
          min={1000}
          max={100000}
          step={1000}
          onChange={setCost}
        />
        <SliderField
          label="Prazo"
          display={`${months} meses`}
          caption={`${isTrip ? 'Viajar' : 'Pronto'} em ${longMonth(START, months)}`}
          value={months}
          min={6}
          max={40}
          step={1}
          onChange={setMonths}
        />
        <MoneyInput
          label="Já guardado"
          value={saved}
          onChangeValue={setSaved}
          helperText={`Separado no ${placeInfo.label}`}
        />
        <ChipField
          label="Onde guardar"
          options={GOAL_PLACES}
          isSelected={(key) => key === place}
          onPress={setPlace}
        />
        <Text size={12} tone="subtle">
          Rendimento estimado de{' '}
          {(placeInfo.monthlyRate * 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}% ao
          mês, já descontado o imposto.
        </Text>
      </PremisesCard>
      {isTablet ? (
        <ResponsiveGrid columns={{ tablet: 2 }} gap={16} stretch>
          {blocks.milestones}
          {blocks.composition}
        </ResponsiveGrid>
      ) : (
        <>
          {blocks.milestones}
          {blocks.composition}
        </>
      )}
      <SimCard title="E se…" description="Quanto tempo leva em outros cenários">
        <FigureRows
          items={result.alternatives.map((item) => ({
            key: item.title,
            title: item.title,
            caption:
              item.months === null
                ? 'não chega à meta'
                : `${isTrip ? 'viagem' : 'pronto'} em ${shortMonth(START, item.months)}${item.note ? ` · ${item.note}` : ''}`,
            value: item.months === null ? '—' : `${item.months} meses`,
            tone: item.months === null ? 'subtle' : item.months > months ? 'negative' : 'positive',
          }))}
        />
      </SimCard>
      <SimCard title="Suas metas" description="Acompanhadas pela Onça">
        <FigureRows
          items={[
            {
              key: 'reserve',
              title: 'Reserva de emergência',
              caption: `${reais(RESERVE.saved)} de ${reais(RESERVE.target)} · ${RESERVE.place}`,
              value: `${Math.round((RESERVE.saved / RESERVE.target) * 100)}%`,
              tone: 'info',
            },
            {
              key: 'this',
              title: goalName,
              caption: 'esta simulação · começa em outubro',
              value: 'novo',
              tone: 'brand',
            },
            {
              key: 'retirement',
              title: 'Aposentadoria',
              caption: `em simulação · aporte de ${reais(RETIREMENT_DEPOSIT)}/mês`,
              value: '—',
              tone: 'subtle',
            },
          ]}
        />
        <Insight icon="target" color={colors.brand.DEFAULT}>
          Com a reserva e {the} {isTrip ? 'juntas' : 'juntos'}, você guardaria{' '}
          <Span weight="bold">{reais(result.withReserve)}/mês</Span>
          {result.withReserve >= HOUSEHOLD.surplus * 0.9
            ? ', perto de tudo o que sobra hoje.'
            : '.'}
        </Insight>
      </SimCard>
      <AskAssistantCard
        assistant="onca"
        subject="sobre esta simulação"
        questions={QUESTIONS.goal}
      />
    </SimulatorFrame>
  );
}
