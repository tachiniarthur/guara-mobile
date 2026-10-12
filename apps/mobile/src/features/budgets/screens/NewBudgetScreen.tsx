import type { Cents, NotificationChannel } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { cents, EMPTY, formatCents, formatDate, joinList } from '@guara/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { CapBarChart, DashedLine, LegendSwatch } from '@/components/charts';
import { toast } from '@/components/feedback';
import { FormScreen, ResponsiveGrid, SectionCard } from '@/components/layout';
import { Checkbox, MoneyInput, SelectField, Text } from '@/components/ui';
import { routeTo } from '@/constants/routes';
import { categoryLabel } from '@/features/spending/categories';
import { SPENDING_TODAY } from '@/features/spending/data';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useUserStore } from '@/stores';

import { BudgetMilestoneBar, MilestoneInputs } from '../components';
import {
  BUDGET_CATEGORIES,
  BUDGET_MONTH,
  BUDGET_PERIODS,
  CATEGORY_HISTORY,
  type BudgetCategory,
  type BudgetPeriod,
} from '../data';
import {
  biggestMonth,
  historyBars,
  historyLabel,
  monthName,
  monthsOverCap,
  threeMonthAverage,
} from '../lib/budgets';
import { useBudgetsStore } from '../store';

const reais = (value: Cents) => formatCents(value, { wholeUnits: true });
const plain = (value: number) => value.toLocaleString('pt-BR');

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'negative' }) {
  const { isTablet } = useBreakpoint();
  return (
    <View className="min-w-0 flex-1 gap-1 rounded-16 bg-surface-input px-3.5 py-3">
      <Text size={12} tone="subtle">
        {label}
      </Text>
      <Text serif weight="bold" size={isTablet ? 19 : 17} tone={tone} tabular>
        {value}
      </Text>
    </View>
  );
}

const isCategory = (value: string | undefined): value is BudgetCategory =>
  BUDGET_CATEGORIES.some((item) => item.value === value);

/**
 * Novo teto de gasto / Editar teto: category, period, cap, warnings before the cap and
 * channels, with the category's last months against the cap.
 */
export function NewBudgetScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const params = useLocalSearchParams<{ budgetId?: string; categoryId?: string }>();
  const budgets = useBudgetsStore((state) => state.budgets);
  const { add, update } = useBudgetsStore();
  const editing = budgets.find((budget) => budget.id === params.budgetId);
  const userEmail = useUserStore((state) => state.email);

  // A category has one cap: new caps offer only the free ones.
  const free = BUDGET_CATEGORIES.filter(
    (item) => !budgets.some((budget) => budget.categoryId === item.value),
  );
  const options = editing
    ? BUDGET_CATEGORIES.filter((item) => item.value === editing.categoryId)
    : free.length
      ? free
      : BUDGET_CATEGORIES;
  const initialCategory =
    editing?.categoryId ??
    (isCategory(params.categoryId) && options.some((item) => item.value === params.categoryId)
      ? params.categoryId
      : options[0]!.value);

  const [category, setCategory] = useState<BudgetCategory>(initialCategory);
  const [period, setPeriod] = useState<BudgetPeriod>(editing?.period ?? 'monthly');
  const [limit, setLimit] = useState<Cents | null>(editing?.limit ?? cents(100_000));
  const [milestones, setMilestones] = useState<(Cents | null)[]>(
    editing?.warnings ?? [cents(50_000), cents(70_000)],
  );
  const [push, setPush] = useState(editing ? editing.channels.includes('push') : true);
  const [email, setEmail] = useState(editing ? editing.channels.includes('email') : true);

  const label = categoryLabel(category);
  const history = CATEGORY_HISTORY[category] ?? [];
  const spent = BUDGET_MONTH[category]?.spent ?? null;
  const average = threeMonthAverage(history);
  const over = limit ? monthsOverCap(history, limit) : [];
  const biggest = biggestMonth(history.slice(0, -1));

  const validMilestones = milestones
    .filter((value): value is Cents => value !== null && limit !== null && value < limit)
    .sort((a, b) => a - b)
    .filter((value, index, all) => all.indexOf(value) === index);
  const noticeCount = validMilestones.length + 1;
  const noticeList = [
    ...validMilestones.map((value) => `em ${reais(value)}`),
    `ao bater o teto de ${limit ? reais(limit) : EMPTY}`,
  ];
  const noticeText = `Você recebe ${noticeCount} ${noticeCount === 1 ? 'aviso' : 'avisos'}: ${joinList(noticeList)}. Cada um chega uma única vez por mês${isTablet ? '' : ' e tudo recomeça no dia 1'}.`;
  const channels: NotificationChannel[] = [
    ...(push ? (['push'] as const) : []),
    ...(email ? (['email'] as const) : []),
  ];

  const save = () => {
    if (!limit) return;
    const fields = { limit, warnings: validMilestones, period, channels };
    if (editing) {
      update(editing.id, fields);
      toast.success('Teto atualizado');
      if (router.canGoBack()) router.back();
      else router.replace(routeTo.budget(editing.id));
      return;
    }
    add({ ...fields, categoryId: category });
    toast.success('Teto criado');
    if (router.canGoBack()) router.back();
    else router.replace('/budgets');
  };

  const averageText = average === null ? EMPTY : reais(average);
  const form = (
    <View className="gap-5.5">
      <ResponsiveGrid columns={{ phone: 1, tablet: 2 }} gap={isTablet ? 14 : 22} stretch={false}>
        <SelectField
          label="Categoria"
          options={options}
          value={category}
          onChange={setCategory}
          textSize={isTablet ? 16 : 17}
        />
        <SelectField
          label="Período"
          options={BUDGET_PERIODS}
          value={period}
          onChange={setPeriod}
          textSize={isTablet ? 16 : 17}
        />
      </ResponsiveGrid>
      <MoneyInput
        label={isTablet ? 'Teto' : 'Teto mensal'}
        value={limit}
        onChangeValue={setLimit}
        size={64}
        display
        rounded={isTablet ? '16' : 'full'}
        helperText={
          isTablet
            ? `Sua média nos últimos 3 meses: ${averageText}. Vale para crédito e débito.`
            : `Sua média nos últimos 3 meses: ${averageText}`
        }
      />
      <MilestoneInputs values={milestones} onChange={setMilestones} />
      <View>
        <Text variant="label" className="mb-1">
          Onde avisar
        </Text>
        <Checkbox
          checked={push}
          onChange={setPush}
          label="Notificação no celular"
          description={isTablet ? undefined : 'Chega na hora'}
          tone={isTablet ? 'default' : 'brand'}
          labelWeight={isTablet ? 'medium' : 'bold'}
        />
        <Checkbox
          checked={email}
          onChange={setEmail}
          label="E-mail"
          description={isTablet ? undefined : userEmail}
          tone={isTablet ? 'default' : 'brand'}
          labelWeight={isTablet ? 'medium' : 'bold'}
        />
        {channels.length ? null : (
          <Text size={13} tone="negative" className="mt-1">
            Escolha pelo menos um jeito de receber os avisos.
          </Text>
        )}
      </View>
    </View>
  );

  const preview = (
    <SectionCard padding={isTablet ? 20 : 16} gap={12}>
      <Text variant="caption" weight="bold" tone="muted">
        Prévia com seus gastos de hoje
      </Text>
      {limit && spent !== null ? (
        <BudgetMilestoneBar spent={spent} limit={limit} milestones={validMilestones} />
      ) : null}
      <Text size={14} leading={1.55} tone="muted">
        {noticeText}
      </Text>
    </SectionCard>
  );

  const current = history.at(-1);
  const historyCard = history.length ? (
    <SectionCard
      title={`${label} nos últimos ${history.length} meses`}
      titleSize={18}
      padding={isTablet ? 20 : 16}
      gap={16}
    >
      <Text variant="caption" tone="muted" className="-mt-3">
        Com o teto de {limit ? reais(limit) : EMPTY},{' '}
        {over.length === 0
          ? 'nenhum mês teria passado do limite.'
          : over.length === 1
            ? `só ${monthName(over[0]!)} teria passado do limite.`
            : `${joinList(over.map(monthName))} teriam passado do limite.`}
      </Text>
      <CapBarChart
        data={historyBars(history)}
        cap={limit ? Math.trunc(limit / 100) : 0}
        average={average === null ? 0 : Math.trunc(average / 100)}
        // The cap sets the scale; bars up to 25% above it still fit over the chart.
        maxValue={Math.max(
          limit ? Math.trunc(limit / 100) : 0,
          ...historyBars(history).map((bar) => bar.value / 1.25),
        )}
        format={plain}
        accessibilityLabel={`${historyLabel(label, history, null)}. Teto novo: ${limit ? reais(limit) : EMPTY}. Média de 3 meses: ${averageText}.`}
      />
      <View className="flex-row flex-wrap gap-x-5 gap-y-2">
        <View className="flex-row items-center gap-2">
          <DashedLine width={22} color={colors.brand.DEFAULT} dash="6 4" />
          <Text size={12} tone="muted">
            Teto novo: {limit ? reais(limit) : EMPTY}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <DashedLine width={22} color={colors.foreground.subtle} dash="2 3" />
          <Text size={12} tone="muted">
            Média de 3 meses: {averageText}
          </Text>
        </View>
        <LegendSwatch label="Passou do teto" color={colors.negative.DEFAULT} shape="dot" />
      </View>
      <ResponsiveGrid columns={{ phone: 2, tablet: 3 }} gap={isTablet ? 12 : 8}>
        <Stat label="Média dos últimos 3 meses" value={averageText} />
        <Stat label="Meses acima do teto" value={`${over.length} de ${history.length}`} />
        {isTablet && biggest ? (
          <Stat
            label="Maior mês"
            value={`${reais(biggest.spent)} em ${monthName(biggest.month)}`}
            tone="negative"
          />
        ) : null}
      </ResponsiveGrid>
      {!isTablet && biggest ? (
        <Stat
          label="Maior mês"
          value={`${reais(biggest.spent)} em ${monthName(biggest.month)}`}
          tone="negative"
        />
      ) : null}
      {current ? (
        <Text size={12} tone="subtle">
          {`*${monthName(current.month)} até o dia ${formatDate(SPENDING_TODAY, 'd')}`}
        </Text>
      ) : null}
    </SectionCard>
  ) : (
    <SectionCard title={`${label} nos últimos meses`} titleSize={18} padding={isTablet ? 20 : 16}>
      <Text size={14} tone="muted" leading={1.55}>
        {`Ainda não temos histórico de ${label} para comparar com o teto. Os avisos já funcionam a partir de agora.`}
      </Text>
    </SectionCard>
  );

  const title = editing ? 'Editar teto' : 'Novo teto de gasto';
  const heading = editing ? `Editar teto de ${label}` : 'Quanto você quer gastar, no máximo?';
  return (
    <FormScreen
      title={title}
      tabletTitle={heading}
      parents={
        editing
          ? [
              { label: 'Tetos de gasto', href: '/budgets' },
              { label, href: routeTo.budget(editing.id) },
            ]
          : [{ label: 'Alertas', href: '/alerts' }]
      }
      current={editing ? 'Editar' : 'Novo teto'}
      fallbackHref={editing ? routeTo.budget(editing.id) : '/alerts'}
      submit={{
        label: editing ? 'Salvar alterações' : 'Salvar teto',
        onPress: save,
        disabled: !limit || channels.length === 0,
      }}
    >
      {isTablet ? (
        <>
          <SectionCard padding={24} gap={16}>
            {form}
          </SectionCard>
          {preview}
          {historyCard}
        </>
      ) : (
        <>
          <View className="gap-1">
            <Text
              serif
              weight="bold"
              size={24}
              leading={1.25}
              tracking={-0.01}
              accessibilityRole="header"
            >
              {heading}
            </Text>
            <Text size={14} tone="muted">
              Vale para crédito e débito de todos os bancos conectados.
            </Text>
          </View>
          {form}
          {preview}
          {historyCard}
        </>
      )}
    </FormScreen>
  );
}
