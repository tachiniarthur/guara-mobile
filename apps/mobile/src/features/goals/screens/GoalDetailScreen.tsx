import type { Cents } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { formatCents, formatDate } from '@guara/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { EmptyState, toast } from '@/components/feedback';
import { PageHeader, Screen, SectionCard, TopBar } from '@/components/layout';
import {
  Badge,
  Button,
  ConfirmDialog,
  Icon,
  IconButton,
  LinkButton,
  MoneyInput,
  MoneyText,
  Sheet,
  Text,
  type IconName,
} from '@/components/ui';
import { AssistantNote } from '@/features/chat';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';
import { ChatFab } from '@/navigation';

import { GoalBalanceChart, GoalBar, GoalHero, HeroCaption, HeroStrong } from '../components';
import { GOAL_EXTRAS, GOALS_TODAY } from '../data';
import {
  firstWords,
  heroCaption,
  historyNote,
  paceBadge,
  shortMonth,
  suggestionText,
  targetText,
} from '../lib/goals';
import { useGoalsStore } from '../store';

const whole = (value: number) => formatCents(value, { wholeUnits: true });

function Row({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      className={cn('flex-row justify-between gap-3 py-[11px]', !last && 'border-b border-border')}
    >
      <Text size={14} tone="muted" style={{ flexShrink: 0 }}>
        {label}
      </Text>
      <Text size={14} weight="semibold" align="right" style={{ flex: 1, minWidth: 0 }}>
        {value}
      </Text>
    </View>
  );
}

function Line({
  title,
  detail,
  icon,
  done,
  trailing,
  last = false,
}: {
  title: string;
  detail: string;
  icon?: IconName;
  done?: boolean;
  trailing?: ReactNode;
  last?: boolean;
}) {
  return (
    <View
      accessible
      accessibilityLabel={`${title}, ${detail}`}
      className={cn('flex-row items-center gap-3 py-3', !last && 'border-b border-border')}
    >
      {icon ? (
        <View
          className={cn(
            'h-8 w-8 items-center justify-center rounded-12',
            done ? 'bg-positive-muted' : 'bg-surface-muted',
          )}
        >
          <Icon
            name={icon}
            size={16}
            strokeWidth={done ? 2.2 : 1.6}
            color={done ? colors.positive.DEFAULT : colors.foreground.muted}
          />
        </View>
      ) : null}
      <View className="min-w-0 flex-1">
        <Text weight="medium" leading={1.35}>
          {title}
        </Text>
        <Text size={12} tone="subtle" leading={1.35}>
          {detail}
        </Text>
      </View>
      {trailing}
    </View>
  );
}

/** Page of a goal: progress, the Onça's suggestion, history, milestones, movements, settings. */
export function GoalDetailScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const goal = useGoalsStore((state) => state.goals.find((item) => item.id === goalId));
  const extraDeposits = useGoalsStore((state) => (goalId ? state.deposits[goalId] : undefined));
  const { setPaused, remove, deposit } = useGoalsStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositValue, setDepositValue] = useState<Cents | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!goal) {
    return (
      <Screen header={<TopBar title="Meta" fallbackHref="/goals" />}>
        <EmptyState
          icon="target"
          title="Meta não encontrada"
          description="Ela pode ter sido excluída. Volte para Suas metas."
          action={{ label: 'Ver metas', onPress: () => router.replace('/goals') }}
        />
      </Screen>
    );
  }

  const extras = GOAL_EXTRAS[goal.id];
  const badge = paceBadge(goal, GOALS_TODAY);
  const caption = heroCaption(goal);
  const paused = goal.status === 'paused';
  const movements = [...(extraDeposits ?? []), ...(extras?.movements ?? [])];
  const milestones = extras?.milestones ?? [];
  const name = firstWords(goal).toLocaleLowerCase('pt-BR');
  const edit = () => router.navigate({ pathname: '/new-goal', params: { goalId: goal.id } });
  const togglePause = () => {
    setPaused(goal.id, !paused);
    toast.success(
      paused ? 'Depósitos retomados' : 'Meta pausada: os depósitos param até você retomar',
    );
  };

  const hero = (
    <GoalHero
      label="Guardado"
      gap={10}
      aside={
        <Badge
          label={badge.label}
          tone={badge.tone}
          icon={badge.tone === 'positive' ? 'check' : undefined}
        />
      }
      value={
        <Text>
          <MoneyText
            value={goal.saved}
            wholeUnits
            serif
            weight="extrabold"
            size={36}
            leading={1.1}
            tracking={-0.01}
          />
          <Text size={16} weight="medium" tone="muted">
            {` de ${targetText(goal.target)}`}
          </Text>
        </Text>
      }
    >
      <GoalBar
        percent={caption.percent}
        tone={badge.tone}
        height={12}
        onMata
        marks={milestones
          .filter((item) => item.percent < 100)
          .map((item) => ({ percent: item.percent, reached: item.reachedOn !== null }))}
      />
      <HeroCaption>
        {`${caption.percent}% · faltam `}
        <HeroStrong>{caption.missing}</HeroStrong>
        {caption.deposit && caption.completion ? (
          <>
            {` · com ${caption.deposit} você completa em `}
            <HeroStrong>{caption.completion}</HeroStrong>
          </>
        ) : null}
      </HeroCaption>
    </GoalHero>
  );

  const suggestion = extras?.suggestion ? (
    <AssistantNote
      assistant="onca"
      actions={
        <Button
          variant="secondary"
          size="md"
          className="h-10 px-4.5"
          onPress={() => router.navigate('/investments/simulator/cut-expense')}
        >
          Simular
        </Button>
      }
    >
      {suggestionText(goal, extras.suggestion)}
    </AssistantNote>
  ) : null;

  const history = extras?.history.length ? (
    <SectionCard
      title={`Como ${name} cresceu`}
      description="Saldo no fim de cada mês"
      titleSize={17}
      padding={18}
    >
      <GoalBalanceChart
        points={extras.history}
        accessibilityLabel={`Saldo de ${goal.name}: ${extras.history
          .map((point) => `${formatDate(`${point.month}-01`, 'MMMM')} ${whole(point.balance)}`)
          .join(', ')}`}
      />
      {historyNote(extras.history, extras.movements) ? (
        <Text size={13} leading={1.55} tone="subtle">
          {historyNote(extras.history, extras.movements)}
        </Text>
      ) : null}
    </SectionCard>
  ) : null;

  const milestonesCard = milestones.length ? (
    <SectionCard title="Marcos" description="A Onça avisa a cada etapa" titleSize={17} padding={18}>
      <View>
        {milestones.map((item, index) => (
          <Line
            key={item.percent}
            title={`${item.percent}% · ${whole(item.amount)}`}
            detail={
              item.reachedOn
                ? `Chegou em ${shortMonth(item.reachedOn)}`
                : `Previsto para ${item.expectedOn ? shortMonth(item.expectedOn) : '—'}${item.percent === 100 && goal.note ? ` · ${goal.note.charAt(0).toLocaleLowerCase('pt-BR')}${goal.note.slice(1)}` : ''}`
            }
            icon={item.reachedOn ? 'check' : item.percent === 100 ? 'target' : 'flag'}
            done={item.reachedOn !== null}
            last={index === milestones.length - 1}
          />
        ))}
      </View>
    </SectionCard>
  ) : null;

  const movementsCard = (
    <SectionCard title="Depósitos e rendimentos" titleSize={17} padding={18}>
      {movements.length === 0 ? (
        <Text size={14} tone="muted">
          Os depósitos aparecem aqui a partir do primeiro.
        </Text>
      ) : (
        <View>
          {movements.map((item, index) => (
            <Line
              key={`${item.date}-${item.label}-${index}`}
              title={item.label}
              detail={formatDate(item.date)}
              last={index === movements.length - 1}
              trailing={
                <MoneyText
                  value={item.amount}
                  showSign
                  weight="bold"
                  tone={item.amount < 0 ? 'negative' : 'positive'}
                />
              }
            />
          ))}
        </View>
      )}
    </SectionCard>
  );

  const settings = (
    <SectionCard title="Ajustes" titleSize={17} padding={18}>
      <View>
        <Row label="Onde está guardado" value={goal.storage?.label ?? '—'} />
        <Row
          label="Depósito mensal"
          value={
            goal.monthlyDeposit
              ? `${whole(goal.monthlyDeposit)}${goal.depositDay ? ` todo dia ${goal.depositDay}` : ''}`
              : '—'
          }
        />
        <Row
          label="Valor da meta"
          value={`${targetText(goal.target)}${goal.note ? ` · ${goal.note.charAt(0).toLocaleLowerCase('pt-BR')}${goal.note.slice(1)}` : ''}`}
        />
        <Row
          label="Previsão"
          value={
            goal.projectedCompletion
              ? `${shortMonth(goal.projectedCompletion)}, com o rendimento`
              : '—'
          }
          last
        />
      </View>
      <View className="flex-row flex-wrap gap-2">
        <Button
          variant="secondary"
          size="md"
          leftIcon="pencil"
          className="h-10 px-4.5"
          onPress={edit}
        >
          Editar meta
        </Button>
        <Button
          variant="secondary"
          size="md"
          leftIcon="plus"
          className="h-10 px-4.5"
          onPress={() => {
            setDepositValue(goal.monthlyDeposit);
            setDepositOpen(true);
          }}
        >
          Depositar agora
        </Button>
        <Button
          variant="ghost"
          size="md"
          leftIcon={paused ? 'retry' : 'pause'}
          className="h-10 px-4.5"
          onPress={togglePause}
        >
          {paused ? 'Retomar' : 'Pausar'}
        </Button>
      </View>
      <LinkButton
        label="Excluir meta"
        chevron={false}
        onPress={() => setDeleteOpen(true)}
        className="self-start"
      />
    </SectionCard>
  );

  const body = isTablet ? (
    <>
      <PageHeader
        title={goal.name}
        subtitle={`${goal.watched ? 'Acompanhada pela Onça · ' : ''}criada em ${shortMonth(goal.createdOn)}`}
        breadcrumb={{ parents: [{ label: 'Suas metas', href: '/goals' }], current: goal.name }}
      />
      {hero}
      <View className="flex-row items-start gap-4">
        <View className="min-w-0 flex-1 gap-4">
          {history}
          {milestonesCard}
        </View>
        <View className="min-w-0 flex-1 gap-4">
          {suggestion}
          {movementsCard}
          {settings}
        </View>
      </View>
    </>
  ) : (
    <>
      {hero}
      {suggestion}
      {history}
      {milestonesCard}
      {movementsCard}
      {settings}
    </>
  );

  return (
    <View className="flex-1">
      <Screen
        header={
          isTablet ? null : (
            <TopBar
              title={goal.name}
              fallbackHref="/goals"
              actions={
                <IconButton
                  icon="moreHorizontal"
                  accessibilityLabel="Mais opções da meta"
                  onPress={() => setMenuOpen(true)}
                />
              }
            />
          )
        }
        contentClassName={isTablet ? 'pb-32' : undefined}
      >
        {body}
      </Screen>
      {isTablet ? <ChatFab /> : null}
      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Opções da meta">
        <View className="gap-2">
          <Button
            variant="secondary"
            fullWidth
            leftIcon="pencil"
            onPress={() => {
              setMenuOpen(false);
              edit();
            }}
          >
            Editar meta
          </Button>
          <Button
            variant="secondary"
            fullWidth
            leftIcon={paused ? 'retry' : 'pause'}
            onPress={() => {
              setMenuOpen(false);
              togglePause();
            }}
          >
            {paused ? 'Retomar depósitos' : 'Pausar meta'}
          </Button>
          <Button
            variant="ghost"
            fullWidth
            leftIcon="trash"
            onPress={() => {
              setMenuOpen(false);
              setDeleteOpen(true);
            }}
          >
            Excluir meta
          </Button>
        </View>
      </Sheet>
      <Sheet open={depositOpen} onClose={() => setDepositOpen(false)} title="Depositar agora">
        <View className="gap-4">
          <MoneyInput
            label="Valor"
            value={depositValue}
            onChangeValue={setDepositValue}
            accessibilityLabel="Valor do depósito"
          />
          <Text size={13} tone="subtle">
            {`Vai para ${goal.storage?.label ?? 'a meta'}, fora do depósito mensal.`}
          </Text>
          <Button
            fullWidth
            leftIcon="check"
            disabled={!depositValue || depositValue <= 0}
            onPress={() => {
              if (!depositValue || depositValue <= 0) return;
              deposit(goal.id, depositValue);
              setDepositOpen(false);
              toast.success(`${whole(depositValue)} depositados em ${goal.name}`);
            }}
          >
            Depositar
          </Button>
        </View>
      </Sheet>
      <ConfirmDialog
        open={deleteOpen}
        title="Excluir esta meta?"
        message="O dinheiro continua onde está guardado; só deixamos de acompanhar a meta."
        confirmLabel="Excluir"
        destructive
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          remove(goal.id);
          toast.success('Meta excluída');
          router.replace('/goals');
        }}
      />
    </View>
  );
}
