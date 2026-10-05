import type { Cents } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { cents, formatCents, formatDate } from '@guara/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { LegendSwatch, ProjectionChart } from '@/components/charts';
import { toast } from '@/components/feedback';
import { FormScreen, ResponsiveGrid, SectionCard } from '@/components/layout';
import {
  Badge,
  Input,
  LinkButton,
  MoneyInput,
  RadioGroup,
  SelectField,
  Switch,
  Text,
} from '@/components/ui';
import {
  GOAL_DEFAULTS,
  GOAL_PLACES,
  HOUSEHOLD,
  ceilToTens,
  projection,
  requiredDeposit,
} from '@/features/simulator';
import { useBreakpoint } from '@/hooks/useBreakpoint';

import {
  GOAL_STORAGE_OPTIONS,
  GOALS_MONTH,
  SALARY_DAY,
  type GoalItem,
  type GoalStorageKey,
} from '../data';
import { longMonth, monthsBetween, newGoalTimeline } from '../lib/goals';
import { useGoalsStore } from '../store';

const MONTH_OPTIONS = [6, 12, 18, 24, 36, 48, 60];
const DAY_OPTIONS = [1, 5, 10, 15, 20, 25];
const whole = (value: number) => formatCents(value, { wholeUnits: true });
const toCents = (reais: number) => cents(Math.round(reais * 100));

function Grid({ children }: { children: ReactNode }) {
  return (
    <ResponsiveGrid columns={{ tablet: 2 }} gap={14}>
      {children}
    </ResponsiveGrid>
  );
}

/** "Nova meta" (also "Transformar em meta" from the simulator and editing a goal). */
export function NewGoalScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const params = useLocalSearchParams<{
    goalId?: string;
    from?: string;
    name?: string;
    cost?: string;
    months?: string;
    saved?: string;
    place?: string;
  }>();
  const editing = useGoalsStore((state) => state.goals.find((goal) => goal.id === params.goalId));
  const { add, update } = useGoalsStore();
  const fromSimulation = params.from === 'simulation';
  // Values chosen in "Juntar para um objetivo" (the simulator defaults when absent).
  const simulated = {
    name: params.name ?? GOAL_DEFAULTS.name,
    cost: Number(params.cost ?? GOAL_DEFAULTS.cost),
    months: Number(params.months ?? GOAL_DEFAULTS.months),
    saved: Number(params.saved ?? GOAL_DEFAULTS.saved),
    place:
      GOAL_STORAGE_OPTIONS.find((option) => option.key === params.place)?.key ??
      GOAL_DEFAULTS.place,
  };
  const initialPlace =
    GOAL_STORAGE_OPTIONS.find((option) => option.label === editing?.storage?.label)?.key ??
    simulated.place;

  const [name, setName] = useState<string>(editing?.name ?? (fromSimulation ? simulated.name : ''));
  const [cost, setCost] = useState<Cents | null>(
    editing?.target ?? (fromSimulation ? toCents(simulated.cost) : null),
  );
  const [months, setMonths] = useState<number>(
    editing?.deadline
      ? Math.max(1, monthsBetween(GOALS_MONTH, editing.deadline) - 1)
      : fromSimulation
        ? simulated.months
        : GOAL_DEFAULTS.months,
  );
  const [saved, setSaved] = useState<Cents | null>(
    editing?.saved ?? (fromSimulation ? toCents(simulated.saved) : null),
  );
  const [place, setPlace] = useState<GoalStorageKey>(initialPlace);
  const [customDeposit, setCustomDeposit] = useState<Cents | null>(null);
  const [day, setDay] = useState<number>(editing?.depositDay ?? SALARY_DAY);
  const [watched, setWatched] = useState(editing?.watched ?? true);
  const [reminder, setReminder] = useState(editing?.depositReminder ?? true);

  const rate = GOAL_PLACES.find((item) => item.key === place)?.monthlyRate ?? 0;
  const costReais = (cost ?? 0) / 100;
  const savedReais = (saved ?? 0) / 100;
  const suggested =
    costReais > 0 ? ceilToTens(requiredDeposit(costReais, savedReais, rate, months)) : 0;
  const depositReais = customDeposit !== null ? customDeposit / 100 : suggested;
  const timeline = newGoalTimeline(GOALS_MONTH, months, day);
  const points = projection(savedReais, depositReais, rate, months, 1);
  const surplusShare = Math.round((depositReais / HOUSEHOLD.surplus) * 100);
  const placeInfo = GOAL_STORAGE_OPTIONS.find((option) => option.key === place);
  const valid = name.trim().length > 0 && costReais > 0 && savedReais < costReais;

  const submit = () => {
    if (!name.trim()) {
      toast.error('Dê um nome para a meta.');
      return;
    }
    if (costReais <= 0) {
      toast.error('Informe quanto custa a meta.');
      return;
    }
    if (savedReais >= costReais) {
      toast.error('O valor já guardado alcança a meta.');
      return;
    }
    const fields = {
      name: name.trim(),
      target: cost!,
      saved: saved ?? cents(0),
      deadline: timeline.reachedOn,
      storage: placeInfo ? { label: placeInfo.label, monthlyYield: rate * 100 } : null,
      monthlyDeposit: depositReais > 0 ? toCents(depositReais) : null,
      depositDay: day,
      projectedCompletion: timeline.reachedOn,
      watched,
      depositReminder: reminder,
    };
    if (editing) {
      update(editing.id, fields);
      toast.success('Meta atualizada');
      if (router.canGoBack()) router.back();
      else router.replace({ pathname: '/goals/[goalId]', params: { goalId: editing.id } });
      return;
    }
    const goal: Omit<GoalItem, 'id'> = {
      ...fields,
      note: null,
      icon: 'target',
      status: 'active',
      pace: 'not_started',
      firstDepositOn: timeline.firstDeposit,
      simulationId: null,
      horizonNote: null,
      createdOn: GOALS_MONTH,
    };
    add(goal);
    toast.success(
      `Meta criada. ${watched ? 'A Onça acompanha' : 'O primeiro depósito é'} a partir de ${formatDate(timeline.firstDeposit, "d 'de' MMMM")}.`,
    );
    router.replace('/goals');
  };

  const nameField = (
    <Input
      label="Nome da meta"
      value={name}
      onChangeText={setName}
      placeholder="Ex.: Viagem, carro novo"
    />
  );
  const costField = (
    <MoneyInput
      label="Quanto custa"
      value={cost}
      onChangeValue={(value) => {
        setCost(value);
        setCustomDeposit(null);
      }}
      size={64}
      display
      rounded="16"
      helperText={
        editing?.note ??
        (fromSimulation ? 'Passagens, hospedagem e passeios para 2 pessoas' : undefined)
      }
    />
  );
  const monthsField = (
    <SelectField
      label="Prazo"
      value={String(months)}
      onChange={(value) => {
        setMonths(Number(value));
        setCustomDeposit(null);
      }}
      options={MONTH_OPTIONS.map((value) => ({
        value: String(value),
        label: `${value} meses · ${longMonth(newGoalTimeline(GOALS_MONTH, value, day).reachedOn)}`,
      }))}
    />
  );
  const savedField = (
    <MoneyInput
      label="Já guardado"
      value={saved}
      onChangeValue={(value) => {
        setSaved(value);
        setCustomDeposit(null);
      }}
      helperText={
        placeInfo && savedReais > 0 ? `Separado no ${placeInfo.label.split(' · ')[0]}` : undefined
      }
    />
  );
  const placeField = (
    <View className="gap-2">
      <Text size={14} weight="bold">
        Onde guardar
      </Text>
      <RadioGroup
        accessibilityLabel="Onde guardar"
        value={place}
        onChange={(value) => {
          setPlace(value);
          setCustomDeposit(null);
        }}
        options={GOAL_STORAGE_OPTIONS.map((option) => ({
          value: option.key,
          label: option.label,
          description:
            option.key === place && savedReais > 0
              ? `${option.detail} · já tem ${whole(saved ?? 0)} separados`
              : option.detail,
        }))}
      />
    </View>
  );
  const depositField = (
    <MoneyInput
      label="Depósito mensal"
      value={customDeposit ?? toCents(suggested)}
      onChangeValue={setCustomDeposit}
      helperText={
        customDeposit === null
          ? `Calculado para chegar no prazo. Equivale a ${surplusShare}% do que sobrou em setembro.`
          : `Equivale a ${surplusShare}% do que sobrou em setembro.`
      }
    />
  );
  const dayField = (
    <SelectField
      label="Dia do depósito"
      value={String(day)}
      onChange={(value) => setDay(Number(value))}
      options={DAY_OPTIONS.map((value) => ({
        value: String(value),
        label:
          value === SALARY_DAY ? `Todo dia ${value}, junto com o salário` : `Todo dia ${value}`,
      }))}
    />
  );

  const preview = (
    <SectionCard
      title="Prévia"
      description="Com os depósitos e o rendimento estimado"
      titleSize={17}
      padding={16}
    >
      {costReais <= 0 ? (
        <Text size={14} tone="muted">
          Informe quanto custa para ver a prévia.
        </Text>
      ) : (
        <ProjectionChart
          values={points.map((point) => point.value)}
          contributed={points.map((point) => point.contributed)}
          goal={{ value: costReais, label: `meta ${whole(cost ?? 0)}` }}
          xLabels={[0, 1, 2, 3].map((index) =>
            formatDate(
              `${newGoalTimeline(GOALS_MONTH, Math.round((months * index) / 3), day).reachedOn}-01`,
              'MMM/yy',
            ),
          )}
          color={colors.positive.DEFAULT}
          describePoint={(index) => whole(toCents(points[index]?.value ?? 0))}
          accessibilityLabel={`Prévia da meta: de ${whole(saved ?? 0)} a ${whole(cost ?? 0)} em ${longMonth(timeline.reachedOn)}`}
        />
      )}
      <View className="flex-row flex-wrap gap-x-4 gap-y-1.5">
        <LegendSwatch label="Guardado com rendimento" color={colors.positive.DEFAULT} width={18} />
        <LegendSwatch label="Só os depósitos" dashed width={18} />
      </View>
      <View className="flex-row flex-wrap" style={{ rowGap: 12, columnGap: 14 }}>
        {[
          { label: 'Falta juntar', value: whole(Math.max(0, (cost ?? 0) - (saved ?? 0))) },
          { label: 'Depósitos', value: `${months} de ${whole(toCents(depositReais))}` },
          { label: 'Primeiro depósito', value: formatDate(timeline.firstDeposit, "d 'de' MMMM") },
          { label: 'Chega em', value: longMonth(timeline.reachedOn) },
        ].map((item) => (
          <View
            key={item.label}
            accessible
            accessibilityLabel={`${item.label}: ${item.value}`}
            className="gap-0.5"
            style={{ width: '47%' }}
          >
            <Text size={13} tone="subtle">
              {item.label}
            </Text>
            <Text size={13} weight="semibold">
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    </SectionCard>
  );

  const tracking = (
    <SectionCard title="Acompanhamento" titleSize={17} padding={16} gap={4}>
      <Switch
        label="A Onça acompanha esta meta"
        description="Avisa se o ritmo cair e comemora cada marco"
        value={watched}
        onValueChange={setWatched}
      />
      <Switch
        label="Lembrete no dia do depósito"
        description="Notificação no celular às 9h"
        value={reminder}
        onValueChange={setReminder}
      />
    </SectionCard>
  );

  const origin = fromSimulation ? (
    <View className="flex-row flex-wrap items-center justify-between gap-2.5">
      <Badge label="Da simulação · Juntar para um objetivo" tone="info" icon="sparkle" />
      <LinkButton
        label="Ver simulação"
        chevron={false}
        onPress={() => router.navigate('/investments/simulator/goal')}
      />
    </View>
  ) : null;

  return (
    <FormScreen
      title={editing ? 'Editar meta' : 'Nova meta'}
      tabletTitle={editing ? 'Editar meta' : fromSimulation ? 'Transformar em meta' : 'Nova meta'}
      parents={
        fromSimulation
          ? [{ label: 'Simulador', href: '/investments/simulator/goal' }]
          : [{ label: 'Suas metas', href: '/goals' }]
      }
      current={editing ? editing.name : 'Nova meta'}
      fallbackHref="/goals"
      submit={{
        label: editing ? 'Salvar meta' : 'Criar meta',
        icon: 'check',
        onPress: submit,
        disabled: !valid,
      }}
      contentClassName="gap-[18px] pt-2"
    >
      {origin}
      {isTablet ? (
        <>
          <SectionCard title="A meta" titleSize={17} padding={20}>
            <Grid>
              {nameField}
              {costField}
              {monthsField}
              {savedField}
            </Grid>
          </SectionCard>
          <SectionCard title="Como guardar" titleSize={17} padding={20}>
            {placeField}
            <Grid>
              {depositField}
              {dayField}
            </Grid>
          </SectionCard>
          <ResponsiveGrid columns={{ tablet: 2 }} gap={16}>
            {preview}
            {tracking}
          </ResponsiveGrid>
        </>
      ) : (
        <>
          {nameField}
          {costField}
          {monthsField}
          {savedField}
          {placeField}
          {depositField}
          {dayField}
          {preview}
          {tracking}
        </>
      )}
    </FormScreen>
  );
}
