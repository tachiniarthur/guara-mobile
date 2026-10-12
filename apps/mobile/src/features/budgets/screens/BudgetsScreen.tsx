import type { BudgetStatus } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { formatCents, formatDate, joinList } from '@guara/utils';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { EmptyState } from '@/components/feedback';
import { MataButton, MataSurface } from '@/components/illustrations';
import { PageHeader, Screen, SectionCard, TopBar } from '@/components/layout';
import { Badge, Button, IconButton, Text } from '@/components/ui';
import { routeTo } from '@/constants/routes';
// Straight to the files: the bank-connections index pulls in the navigation.
import { useBankConnectionsStore } from '@/features/bank-connections/store';
import { AssistantNote } from '@/features/chat/components/AssistantNote';
import { categoryLabel } from '@/features/spending/categories';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ChatFab } from '@/navigation/ChatFab';

import { BudgetRow, BudgetStatusBadge, PlainRow, STATUS_TONE } from '../components';
import { CATEGORY_HISTORY, PAST_MONTHS } from '../data';
import { useBudgets } from '../hooks/useBudgets';
import { STATUS_HINT, STATUS_LABEL, budgetTotals, capSuggestion, monthName } from '../lib/budgets';

const NEW_BUDGET = '/new-budget';
const STATUSES: BudgetStatus[] = ['ok', 'warning', 'exceeded'];
const whole = (value: number) => formatCents(value, { wholeUnits: true });
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** "outubro": the month after the current one, when every cap starts over. */
function nextMonthName(month: string): string {
  const [year = 0, number = 1] = month.split('-').map(Number);
  const next = number === 12 ? `${year + 1}-01` : `${year}-${String(number + 1).padStart(2, '0')}`;
  return formatDate(`${next}-01`, 'MMMM');
}

function HowItWorks() {
  const connections = useBankConnectionsStore((state) => state.connections);
  const banks = connections.map((bank) => bank.name);
  const rows = [
    {
      icon: 'repeat',
      title: 'Recomeça todo dia 1º',
      caption: 'O consumo zera no começo de cada mês',
    },
    {
      icon: 'alertTriangle',
      title: 'Avisos no caminho',
      caption: 'Opcional: por exemplo R$ 500 e R$ 700 num teto de R$ 1.000',
    },
    {
      icon: 'check',
      title: 'Um aviso de cada, por mês',
      caption: 'Pelo celular, por e-mail ou pelos dois',
    },
    {
      icon: 'bank',
      title: 'Todos os bancos juntos',
      caption: banks.length
        ? `Conta crédito e débito ${joinList(banks.map((bank) => `do ${bank}`))}`
        : 'Conta crédito e débito de todos os bancos conectados',
    },
  ] as const;
  return (
    <SectionCard title="Como funcionam os tetos" titleSize={18} padding={22} gap={14}>
      <View>
        {rows.map((row, index) => (
          <PlainRow key={row.title} {...row} last={index === rows.length - 1} />
        ))}
      </View>
    </SectionCard>
  );
}

function EmptyBudgets({ onCreate }: { onCreate: (categoryId?: string) => void }) {
  const history = CATEGORY_HISTORY.food;
  const suggestion = history ? capSuggestion(history) : null;
  const label = categoryLabel('food');
  return (
    <>
      <SectionCard padding={16}>
        <EmptyState
          icon="target"
          title="Nenhum teto ainda"
          description="Um teto avisa antes de você passar do limite que escolheu para uma categoria. Os avisos chegam uma vez por mês."
          actions={<MataButton label="Criar teto" size={44} onPress={() => onCreate()} />}
        />
      </SectionCard>
      {suggestion ? (
        <AssistantNote
          assistant="tamandua"
          actions={
            <Button
              variant="secondary"
              size="md"
              className="h-10 px-4.5"
              onPress={() => onCreate('food')}
            >
              {`Criar teto de ${label}`}
            </Button>
          }
        >
          {`${label} teve média de ${whole(suggestion.average)} nos últimos 3 meses. Um teto de ${whole(suggestion.limit)} deixaria folga${
            suggestion.monthsOver.length
              ? ` e avisaria em ${joinList(suggestion.monthsOver.map(monthName))}, quando passou disso`
              : ''
          }.`}
        </AssistantNote>
      ) : null}
      <HowItWorks />
    </>
  );
}

/** "Tetos de gasto": every cap of the month, the closed months and the empty state. */
export function BudgetsScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { month, budgets } = useBudgets();
  const totals = budgetTotals(budgets);
  const monthLabel = capitalize(formatDate(`${month}-01`, 'MMMM'));
  const create = (categoryId?: string) =>
    router.navigate(categoryId ? { pathname: NEW_BUDGET, params: { categoryId } } : NEW_BUDGET);

  const content = budgets.length ? (
    <>
      <MataSurface
        veil={[0.85, 0.55, 0.1]}
        className="gap-2.5 rounded-24 border border-border-strong bg-hero p-5"
      >
        <Text size={14} style={{ color: colors.hero.label }}>
          {`${monthLabel} · ${budgets.length} ${budgets.length === 1 ? 'teto ativo' : 'tetos ativos'}`}
        </Text>
        <View className="flex-row flex-wrap items-baseline">
          <Text serif weight="extrabold" size={34} leading={1.1} tabular>
            {formatCents(totals.spent)}
          </Text>
          <Text serif size={16} weight="medium" tone="muted">
            {` de ${formatCents(totals.limit)}`}
          </Text>
        </View>
        <View className="h-2.5 rounded-5 bg-scrim-strong" style={{ borderRadius: 5 }}>
          <View
            className="h-2.5 bg-brand"
            style={{ width: `${Math.min(100, totals.percent)}%`, borderRadius: 5 }}
          />
        </View>
        <Text size={14} style={{ color: colors.hero.caption }}>
          {`${totals.percent}% do total dos tetos · recomeçam no dia 1º de ${nextMonthName(month)}`}
        </Text>
      </MataSurface>
      <SectionCard
        title="Tetos do mês"
        description="Cada aviso chega uma vez por mês, somando crédito e débito"
        titleSize={19}
        padding={22}
        gap={10}
      >
        <View>
          {budgets.map((budget, index) => (
            <BudgetRow
              key={budget.id}
              budget={budget}
              last={index === budgets.length - 1}
              onPress={() => router.navigate(routeTo.budget(budget.id))}
            />
          ))}
        </View>
        <View className="flex-row flex-wrap items-center gap-x-4 gap-y-2">
          {STATUSES.map((status) => (
            <View key={status} className="flex-row items-center gap-2">
              <Badge label={STATUS_LABEL[status]} tone={STATUS_TONE[status]} />
              <Text size={13} tone="muted">
                {STATUS_HINT[status]}
              </Text>
            </View>
          ))}
        </View>
      </SectionCard>
      <SectionCard title="Meses anteriores" titleSize={18} padding={22} gap={14}>
        <View>
          {PAST_MONTHS.filter((item) => item.month < month).map((item, index, all) => (
            <PlainRow
              key={item.month}
              title={capitalize(monthName(item.month))}
              caption={
                item.exceeded.length
                  ? item.exceeded
                      .map(
                        (cap) =>
                          `${categoryLabel(cap.categoryId)}: ${whole(cap.spent)} de ${whole(cap.limit)}`,
                      )
                      .join(' · ')
                  : 'Nenhum teto estourado'
              }
              trailing={<BudgetStatusBadge status={item.exceeded.length ? 'exceeded' : 'ok'} />}
              last={index === all.length - 1}
            />
          ))}
        </View>
      </SectionCard>
      {isTablet ? null : <MataButton label="Novo teto" fullWidth onPress={() => create()} />}
    </>
  ) : (
    <EmptyBudgets onCreate={create} />
  );

  return (
    <View className="flex-1">
      <Screen
        header={
          isTablet ? null : (
            <TopBar
              title="Tetos de gasto"
              fallbackHref="/alerts"
              actions={
                <IconButton icon="plus" accessibilityLabel="Novo teto" onPress={() => create()} />
              }
            />
          )
        }
        contentClassName={isTablet ? 'gap-5 pb-32' : 'gap-4 pt-1'}
      >
        {isTablet ? (
          <PageHeader
            title="Tetos de gasto"
            subtitle={
              budgets.length
                ? capitalize(formatDate(`${month}-01`, 'MMMM yyyy'))
                : 'Nenhum teto criado'
            }
            breadcrumb={{
              parents: [{ label: 'Alertas', href: '/alerts' }],
              current: 'Tetos de gasto',
            }}
            actions={
              budgets.length ? (
                <MataButton label="Novo teto" icon="plus" size={44} onPress={() => create()} />
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
