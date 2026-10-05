import type { Cents } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { cents } from '@guara/utils';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { LegendSwatch, ProjectionChart } from '@/components/charts';
import { toast } from '@/components/feedback';
import { ResponsiveGrid } from '@/components/layout';
import { Button, MoneyInput, Span, Text } from '@/components/ui';
import { AskAssistantCard } from '@/features/chat';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { conversationHref } from '@/navigation';

import {
  Composition,
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
import { HOUSEHOLD, QUESTIONS, RETIREMENT_DEFAULTS, RETIREMENT_INCLUDES, START } from '../data';
import { compact, longAmount, millions, reais, reaisWithCents, yearlyPercent } from '../lib/format';
import { useSavedPremises } from '../hooks/useSavedPremises';
import { simulateRetirement } from '../lib/retirement';
import { useSimulationsStore } from '../store';

type Include = (typeof RETIREMENT_INCLUDES)[number]['key'];

/** Simulador · Aposentadoria: monthly deposit to live off the portfolio, with every premise adjustable. */
export function RetirementSimulationScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const opened = useSavedPremises('retirement');
  const initial = opened?.input ?? { ...RETIREMENT_DEFAULTS, start: HOUSEHOLD.invested };
  const saveSimulation = useSimulationsStore((state) => state.save);
  const [years, setYears] = useState<number>(initial.years);
  const [income, setIncome] = useState<number>(initial.income);
  const [rate, setRate] = useState<number>(initial.rate);
  const [withdrawal, setWithdrawal] = useState<number>(initial.withdrawal);
  const [invested, setInvested] = useState<Cents | null>(cents(Math.round(initial.start * 100)));
  const [includes, setIncludes] = useState<Include[]>([]);

  const start =
    (invested ?? 0) / 100 + (includes.includes('properties') ? HOUSEHOLD.properties : 0);
  const result = simulateRetirement({ years, income, rate, withdrawal, start });
  const retireYear = START.year + years;

  const toggleInclude = (key: Include) => {
    if (key !== 'properties') {
      toast.info('Conecte sua previdência e o INSS para incluir na conta.');
      return;
    }
    setIncludes((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  const milestones = result.milestones.map((step, index) => ({
    key: String(index),
    date: step.year === null ? '—' : String(step.year),
    title: compact(step.value, 0),
    caption: step.caption ?? `meta: renda de ${reais(income)}/mês`,
  }));

  const blocks = {
    milestones: (
      <SimCard title="Marcos do caminho" description="Quando o patrimônio chega em cada etapa">
        <MilestoneList items={milestones} color={colors.info.DEFAULT} />
      </SimCard>
    ),
    composition: (
      <SimCard
        title="De onde vem o dinheiro"
        description={`Em ${retireYear}, o que é seu e o que são juros`}
      >
        <Composition
          parts={[
            {
              label: 'Seus aportes',
              value: result.contributed,
              display: millions(result.contributed),
              color: colors.foreground.subtle,
            },
            {
              label: 'Juros compostos',
              value: Math.max(0, result.interest),
              display: millions(Math.max(0, result.interest)),
              color: colors.info.DEFAULT,
            },
          ]}
        />
        <Insight icon="target" color={colors.info.DEFAULT}>
          Quase <Span weight="bold">{Math.round((result.interest / result.final) * 100)}%</Span> da
          meta vem dos juros. Quanto antes começar, maior essa parte.
        </Insight>
      </SimCard>
    ),
  };

  return (
    <SimulatorFrame
      active="retirement"
      notice={
        opened ? (
          <SavedNotice
            simulation={opened.simulation}
            onRefresh={
              invested === cents(Math.round(HOUSEHOLD.invested * 100))
                ? undefined
                : () => setInvested(cents(Math.round(HOUSEHOLD.invested * 100)))
            }
          />
        ) : null
      }
    >
      <ResultCard
        title="O caminho do seu futuro"
        subtitle={`Aposentadoria em ${years} anos, em valores de hoje`}
        label="Aporte mensal necessário"
        value={reais(result.deposit)}
        caption={
          <Text size={14} tone="muted">
            Patrimônio necessário:{' '}
            <Span weight="bold" tone="default">
              {longAmount(result.goal)}
            </Span>{' '}
            · equivale a {Math.round(result.incomeShare)}% das suas entradas de setembro
          </Text>
        }
        chart={
          <ProjectionChart
            values={result.points.map((point) => point.value)}
            contributed={result.points.map((point) => point.contributed)}
            goal={{ value: result.goal, label: `Meta ${millions(result.goal, 1)}` }}
            xLabels={Array.from({ length: 6 }, (_, index) =>
              String(START.year + Math.round((years * index) / 5)),
            )}
            describePoint={(index) =>
              `${START.year + index}: ${compact(result.points[index]?.value ?? 0)}`
            }
            wide={isTablet}
            accessibilityLabel={`Patrimônio projetado de ${START.year} a ${retireYear}, chegando a ${compact(result.final, 1)}. A área cinza mostra quanto vem dos seus aportes.`}
          />
        }
        legend={
          <View className="flex-row flex-wrap gap-x-4.5 gap-y-2">
            <LegendSwatch
              label="Patrimônio projetado"
              color={colors.info.DEFAULT}
              width={18}
              size={13}
            />
            <LegendSwatch label="Só o que você aportou" dashed width={18} size={13} />
            <LegendSwatch label="Meta" dashed color={colors.brand.DEFAULT} width={18} size={13} />
          </View>
        }
        scenarios={result.profiles.map((profile) => ({
          key: profile.key,
          label: profile.label,
          caption: `${profile.rate}% a.a.${profile.label === HOUSEHOLD.profile ? ' · seu perfil' : ''}`,
          value: reais(profile.deposit),
          selected: profile.rate === rate,
          onPress: () => setRate(profile.rate),
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
              onPress={() => {
                saveSimulation(`Aposentadoria em ${retireYear}`, {
                  kind: 'retirement',
                  years,
                  income,
                  rate,
                  withdrawal,
                  start,
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
              onPress={() => router.navigate(conversationHref(undefined, { assistant: 'pacu' }))}
            >
              Conversar com Pacu
            </Button>
          </>
        }
        footnote="Simulação educativa em valores de hoje. Não é recomendação de investimento."
        wide={isTablet}
      />
      <PremisesCard
        summary={[
          { label: 'Suas entradas hoje', value: `${reais(HOUSEHOLD.income)}/mês` },
          { label: 'Perfil de investidor', value: HOUSEHOLD.profile },
          { label: 'Valores', value: 'corrigidos pela inflação' },
        ]}
      >
        <SliderField
          label="Prazo"
          display={`${years} anos`}
          caption={`Aposentar em ${retireYear}`}
          value={years}
          min={5}
          max={45}
          step={1}
          onChange={setYears}
        />
        <SliderField
          label="Renda mensal desejada"
          display={reais(income)}
          caption="Em valores de hoje"
          value={income}
          min={2000}
          max={22000}
          step={500}
          onChange={setIncome}
        />
        <MoneyInput
          label="Já investido"
          value={invested}
          onChangeValue={setInvested}
          helperText="Puxado da sua carteira"
        />
        <SliderField
          label="Rentabilidade real"
          display={yearlyPercent(rate)}
          caption={`Acima da inflação · perfil ${HOUSEHOLD.profile}`}
          value={rate}
          min={1}
          max={7.5}
          step={0.1}
          onChange={setRate}
        />
        <SliderField
          label="Taxa de retirada"
          display={yearlyPercent(withdrawal)}
          caption="Quanto do patrimônio você usa por ano"
          value={withdrawal}
          min={2}
          max={7}
          step={0.1}
          onChange={setWithdrawal}
        />
        <ChipField
          label="Incluir na conta"
          options={RETIREMENT_INCLUDES}
          isSelected={(key) => includes.includes(key)}
          onPress={toggleInclude}
        />
        <Text size={12} tone="subtle">
          Imóveis e INSS não entram por padrão. Marque para ver o efeito.
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
      <SimCard title="E se…" description="Como o aporte muda com outras escolhas">
        <FigureRows
          items={result.alternatives.map((item) => ({
            key: item.title,
            title: item.title,
            caption: item.detail,
            value: `${reais(item.deposit)}/mês`,
            tone: item.deposit <= result.deposit ? 'positive' : 'negative',
          }))}
        />
      </SimCard>
      <SimCard title="Cabe no seu orçamento?" description="Comparado com o que sobrou em setembro">
        <FigureRows
          items={[
            { key: 'deposit', title: 'Aporte necessário', value: `${reais(result.deposit)}/mês` },
            {
              key: 'surplus',
              title: 'Sobra média do mês',
              caption: 'entradas menos saídas',
              value: `${reaisWithCents(result.budget.surplus)}/mês`,
              tone: 'positive',
            },
            result.budget.gap > 0
              ? {
                  key: 'gap',
                  title: 'Diferença',
                  caption: 'o que falta por mês',
                  value: `${reais(result.budget.gap)}/mês`,
                  tone: 'negative',
                }
              : {
                  key: 'gap',
                  title: 'Diferença',
                  caption: 'o que sobra por mês',
                  value: `${reais(-result.budget.gap)}/mês`,
                  tone: 'positive',
                },
          ]}
        />
        <Insight icon="target" color={colors.info.DEFAULT}>
          Guardando só a sobra de hoje, você chegaria a{' '}
          <Span weight="bold">{millions(result.budget.surplusFinal)}</Span> em {retireYear}, uma
          renda de <Span weight="bold">{reais(result.budget.surplusIncome)}/mês</Span>.
        </Insight>
        <View className="flex-row flex-wrap gap-2">
          <Button
            variant="secondary"
            size="md"
            leftIcon="scissors"
            className="px-4.5"
            onPress={() => router.replace('/investments/simulator/cut-expense')}
          >
            Ver onde cortar
          </Button>
        </View>
      </SimCard>
      <AskAssistantCard
        assistant="pacu"
        subject="sobre esta simulação"
        questions={QUESTIONS.retirement}
      />
    </SimulatorFrame>
  );
}
