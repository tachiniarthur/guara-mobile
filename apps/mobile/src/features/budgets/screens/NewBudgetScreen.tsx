import type { Cents } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { cents, formatCents } from '@guara/utils';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { CapBarChart, DashedLine, LegendSwatch } from '@/components/charts';
import { toast } from '@/components/feedback';
import { FormScreen, ResponsiveGrid, SectionCard } from '@/components/layout';
import { Checkbox, MoneyInput, SelectField, Text } from '@/components/ui';
import { CURRENT_USER } from '@/features/account';
import { useBreakpoint } from '@/hooks/useBreakpoint';

import { BudgetMilestoneBar, MilestoneInputs } from '../components';
import {
  BUDGET_CATEGORIES,
  BUDGET_PERIODS,
  CATEGORY_AVERAGE,
  CATEGORY_HISTORY,
  CATEGORY_SPENT,
  MONTH_NAMES,
  type BudgetCategory,
  type BudgetPeriod,
} from '../data';

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

/** Novo teto de gasto: category, period, cap, warnings before the cap and channels. */
export function NewBudgetScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const [category, setCategory] = useState<BudgetCategory>('food');
  const [period, setPeriod] = useState<BudgetPeriod>('monthly');
  const [limit, setLimit] = useState<Cents | null>(cents(100_000));
  const [milestones, setMilestones] = useState<(Cents | null)[]>([cents(50_000), cents(70_000)]);
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);

  const validMilestones = milestones
    .filter((value): value is Cents => value !== null && limit !== null && value < limit)
    .sort((a, b) => a - b);
  const capReais = limit ? Math.trunc(limit / 100) : 0;
  const over = CATEGORY_HISTORY.filter((month) => month.value > capReais);
  const biggest = CATEGORY_HISTORY.reduce((max, month) => (month.value > max.value ? month : max));
  const noticeCount = validMilestones.length + 1;
  const noticeList = [
    ...validMilestones.map((value) => `em ${reais(value)}`),
    `ao bater o teto de ${limit ? reais(limit) : '—'}`,
  ];
  const noticeText = `Você recebe ${noticeCount} ${noticeCount === 1 ? 'aviso' : 'avisos'}: ${noticeList.slice(0, -1).join(', ')}${noticeList.length > 1 ? ' e ' : ''}${noticeList[noticeList.length - 1]}. Cada um chega uma única vez por mês${isTablet ? '' : ' e tudo recomeça no dia 1'}.`;

  const save = () => {
    toast.success('Teto criado');
    if (router.canGoBack()) router.back();
    else router.replace('/alerts');
  };

  const form = (
    <View className="gap-5.5">
      <ResponsiveGrid columns={{ phone: 1, tablet: 2 }} gap={isTablet ? 14 : 22} stretch={false}>
        <SelectField
          label="Categoria"
          options={BUDGET_CATEGORIES}
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
            ? `Sua média nos últimos 3 meses: R$ ${plain(CATEGORY_AVERAGE)}. Vale para crédito e débito.`
            : `Sua média nos últimos 3 meses: R$ ${plain(CATEGORY_AVERAGE)}`
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
          description={isTablet ? undefined : CURRENT_USER.email}
          tone={isTablet ? 'default' : 'brand'}
          labelWeight={isTablet ? 'medium' : 'bold'}
        />
      </View>
    </View>
  );

  const preview = (
    <SectionCard padding={isTablet ? 20 : 16} gap={12}>
      <Text variant="caption" weight="bold" tone="muted">
        Prévia com seus gastos de hoje
      </Text>
      {limit ? (
        <BudgetMilestoneBar spent={CATEGORY_SPENT} limit={limit} milestones={validMilestones} />
      ) : null}
      <Text size={14} leading={1.55} tone="muted">
        {noticeText}
      </Text>
    </SectionCard>
  );

  const history = (
    <SectionCard
      title="Alimentação nos últimos 6 meses"
      titleSize={18}
      padding={isTablet ? 20 : 16}
      gap={16}
    >
      <Text variant="caption" tone="muted" className="-mt-3">
        Com o teto de {limit ? reais(limit) : '—'},{' '}
        {over.length === 0
          ? 'nenhum mês teria passado do limite.'
          : over.length === 1
            ? `só ${MONTH_NAMES[over[0]!.label]} teria passado do limite.`
            : `${over.length} meses teriam passado do limite.`}
      </Text>
      <CapBarChart
        data={CATEGORY_HISTORY}
        cap={capReais}
        average={CATEGORY_AVERAGE}
        maxValue={Math.max(1000, capReais)}
        format={plain}
        accessibilityLabel={`Gastos com alimentação por mês: abril 790, maio 860, junho 880, julho 1.020, agosto 830, setembro até agora 742. Teto novo: ${plain(capReais)}. Média de 3 meses: ${plain(CATEGORY_AVERAGE)}.`}
      />
      <View className="flex-row flex-wrap gap-x-5 gap-y-2">
        <View className="flex-row items-center gap-2">
          <DashedLine width={22} color={colors.brand.DEFAULT} dash="6 4" />
          <Text size={12} tone="muted">
            Teto novo: {limit ? reais(limit) : '—'}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <DashedLine width={22} color={colors.foreground.subtle} dash="2 3" />
          <Text size={12} tone="muted">
            Média de 3 meses: R$ {plain(CATEGORY_AVERAGE)}
          </Text>
        </View>
        <LegendSwatch label="Passou do teto" color={colors.negative.DEFAULT} shape="dot" />
      </View>
      <ResponsiveGrid columns={{ phone: 2, tablet: 3 }} gap={isTablet ? 12 : 8}>
        <Stat label="Média dos últimos 3 meses" value={`R$ ${plain(CATEGORY_AVERAGE)}`} />
        <Stat label="Meses acima do teto" value={`${over.length} de ${CATEGORY_HISTORY.length}`} />
        {isTablet ? (
          <Stat
            label="Maior mês"
            value={`R$ ${plain(biggest.value)} em ${MONTH_NAMES[biggest.label]}`}
            tone="negative"
          />
        ) : null}
      </ResponsiveGrid>
      {isTablet ? null : (
        <Stat
          label="Maior mês"
          value={`R$ ${plain(biggest.value)} em ${MONTH_NAMES[biggest.label]}`}
          tone="negative"
        />
      )}
      <Text size={12} tone="subtle">
        *setembro até o dia 23
      </Text>
    </SectionCard>
  );

  return (
    <FormScreen
      title="Novo teto de gasto"
      tabletTitle="Quanto você quer gastar, no máximo?"
      parents={[{ label: 'Alertas', href: '/alerts' }]}
      current="Novo teto"
      fallbackHref="/alerts"
      submit={{ label: 'Salvar teto', onPress: save, disabled: !limit }}
    >
      {isTablet ? (
        <>
          <SectionCard padding={24} gap={16}>
            {form}
          </SectionCard>
          {preview}
          {history}
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
              Quanto você quer gastar, no máximo?
            </Text>
            <Text size={14} tone="muted">
              Vale para crédito e débito de todos os bancos conectados.
            </Text>
          </View>
          {form}
          {preview}
          {history}
        </>
      )}
    </FormScreen>
  );
}
