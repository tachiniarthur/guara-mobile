import type { Cents, GoalMovement, IsoDate, YearMonth } from '@guara/types';
import { cents, formatCents, formatDate, sumCents } from '@guara/utils';

import type { GoalItem } from '../data';

const whole = (value: number) => formatCents(value, { wholeUnits: true });

/** "set/2027" */
export function shortMonth(month: YearMonth): string {
  return formatDate(`${month}-01`, 'MMM/yyyy');
}

/** "abril de 2028" */
export function longMonth(month: YearMonth): string {
  return formatDate(`${month}-01`, "MMMM 'de' yyyy");
}

function addMonths(month: YearMonth, count: number): YearMonth {
  const [year = 0, value = 1] = month.split('-').map(Number);
  const index = year * 12 + (value - 1) + count;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`;
}

export function monthsBetween(from: YearMonth, to: YearMonth): number {
  const [fromYear = 0, fromMonth = 1] = from.split('-').map(Number);
  const [toYear = 0, toMonth = 1] = to.split('-').map(Number);
  return (toYear - fromYear) * 12 + (toMonth - fromMonth);
}

/** Share of the target already saved, rounded (100 only once the target is reached). */
export function progressPercent(goal: Pick<GoalItem, 'saved' | 'target'>): number {
  if (goal.saved >= goal.target) return 100;
  return Math.min(99, Math.round((goal.saved / goal.target) * 100));
}

/** Goals still counted: not archived. */
export function visibleGoals(goals: readonly GoalItem[]): GoalItem[] {
  return goals.filter((goal) => goal.status !== 'archived');
}

/** "Depósitos planejados": active goals whose deposit fits what is left over each month. */
export function plannedDeposits(goals: readonly GoalItem[]) {
  const counted = goals.filter(
    (goal) => goal.status === 'active' && goal.pace !== 'above_surplus' && goal.monthlyDeposit,
  );
  const left = goals.filter((goal) => goal.status === 'active' && goal.pace === 'above_surplus');
  return {
    total: sumCents(counted.map((goal) => goal.monthlyDeposit ?? cents(0))),
    /** "sem a aposentadoria" */
    without: left.map((goal) => goal.name.toLocaleLowerCase('pt-BR')),
  };
}

/** Next deposit date on or after `today` ("5/10"). */
export function nextDeposit(goal: GoalItem, today: IsoDate): IsoDate | null {
  if (goal.firstDepositOn && goal.firstDepositOn >= today) return goal.firstDepositOn;
  if (!goal.depositDay) return null;
  const [year = 0, month = 1, day = 1] = today.split('-').map(Number);
  const next =
    day <= goal.depositDay
      ? { year, month }
      : month === 12
        ? { year: year + 1, month: 1 }
        : { year, month: month + 1 };
  return `${next.year}-${String(next.month).padStart(2, '0')}-${String(goal.depositDay).padStart(2, '0')}`;
}

export type BadgeTone = 'positive' | 'info' | 'warning' | 'negative' | 'neutral';

/** State pill of a goal ("No ritmo", "Começa em 5/10", "Acima do que sobra"). */
export function paceBadge(goal: GoalItem, today: IsoDate): { label: string; tone: BadgeTone } {
  if (goal.status === 'paused') return { label: 'Pausada', tone: 'neutral' };
  if (goal.status === 'achieved') return { label: 'Concluída', tone: 'positive' };
  switch (goal.pace) {
    case 'on_track':
      return { label: 'No ritmo', tone: 'positive' };
    case 'not_started': {
      const first = nextDeposit(goal, today);
      return {
        label: first ? `Começa em ${formatDate(first, 'd/M')}` : 'Ainda não começou',
        tone: 'info',
      };
    }
    case 'behind':
      return { label: 'Atrasada', tone: 'negative' };
    case 'above_surplus':
      return { label: 'Acima do que sobra', tone: 'warning' };
  }
}

/** Right side under the bar: forecast, deadline or the horizon of the simulation. */
export function horizonText(goal: GoalItem): string {
  if (goal.horizonNote) return goal.horizonNote;
  if (goal.pace === 'on_track' && goal.projectedCompletion) {
    return `previsão ${shortMonth(goal.projectedCompletion)}`;
  }
  if (goal.deadline) return longMonth(goal.deadline);
  if (goal.projectedCompletion) return `previsão ${shortMonth(goal.projectedCompletion)}`;
  return '—';
}

/** Target of the card: "R$ 30.000", "R$ 3,0 milhões". */
export function targetText(value: Cents): string {
  if (value >= 100_000_000) {
    const millions = value / 100_000_000;
    return `R$ ${millions.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} milhões`;
  }
  return whole(value);
}

/**
 * Onça on the list: the next deposit of the goal on track, the goal that starts and the one
 * that asks more than is left over.
 */
export function listNote(goals: readonly GoalItem[], today: IsoDate): string | null {
  const parts: string[] = [];
  const onTrack = goals.find((goal) => goal.status === 'active' && goal.pace === 'on_track');
  const firstDate = onTrack ? nextDeposit(onTrack, today) : null;
  if (onTrack && onTrack.monthlyDeposit && firstDate) {
    const after = Math.floor(((onTrack.saved + onTrack.monthlyDeposit) / onTrack.target) * 100);
    parts.push(
      `${firstWords(onTrack)} está no ritmo: mais ${whole(onTrack.monthlyDeposit)} em ${formatDate(firstDate, 'd/M')} e você passa de ${after}%.`,
    );
  }
  const starting = goals.find((goal) => goal.status === 'active' && goal.pace === 'not_started');
  const startDate = starting ? nextDeposit(starting, today) : null;
  if (starting && startDate) {
    parts.push(
      startDate === firstDate
        ? `${firstWords(starting)} começa no mesmo dia.`
        : `${firstWords(starting)} começa em ${formatDate(startDate, 'd/M')}.`,
    );
  }
  const above = goals.find((goal) => goal.status === 'active' && goal.pace === 'above_surplus');
  if (above) {
    parts.push(`${firstWords(above)} pede mais do que sobra hoje; quer ver onde ajustar?`);
  }
  return parts.length > 0 ? parts.join(' ') : null;
}

/** "A reserva", "A viagem", "A aposentadoria": how the Onça calls each goal. */
export function firstWords(goal: Pick<GoalItem, 'name'>): string {
  const first = goal.name.split(' ')[0]?.toLocaleLowerCase('pt-BR') ?? '';
  const feminine = first.endsWith('a') || first.endsWith('agem') || first.endsWith('ade');
  return `${feminine ? 'A' : 'O'} ${first}`;
}

/** "53% · faltam R$ 14.108 · com R$ 990/mês você completa em set/2027" */
export function heroCaption(goal: GoalItem) {
  const missing = Math.max(0, goal.target - goal.saved);
  return {
    percent: progressPercent(goal),
    missing: whole(missing),
    deposit: goal.monthlyDeposit ? `${whole(goal.monthlyDeposit)}/mês` : null,
    completion: goal.projectedCompletion ? shortMonth(goal.projectedCompletion) : null,
  };
}

/** Onça on a goal page: what an extra monthly amount from a simulation would change. */
export function suggestionText(
  goal: GoalItem,
  suggestion: { amount: Cents; source: string; readyOn: YearMonth },
): string {
  const earlier = goal.projectedCompletion
    ? monthsBetween(suggestion.readyOn, goal.projectedCompletion)
    : 0;
  const tail = earlier > 0 ? `, ${earlier} ${earlier === 1 ? 'mês' : 'meses'} antes` : '';
  return `Se você mandar os ${whole(suggestion.amount)} do ${suggestion.source} para cá, ${firstWords(goal).toLocaleLowerCase('pt-BR')} fica pronta em ${shortMonth(suggestion.readyOn)}${tail}.`;
}

/** Explains a month that went down ("Junho caiu por um resgate de R$ 1.200…"). */
export function historyNote(
  history: readonly { month: YearMonth; balance: Cents }[],
  movements: readonly GoalMovement[],
): string | null {
  for (let index = 1; index < history.length; index += 1) {
    const current = history[index]!;
    if (current.balance >= history[index - 1]!.balance) continue;
    const withdrawal = movements.find(
      (movement) => movement.kind === 'withdrawal' && movement.date.startsWith(current.month),
    );
    if (!withdrawal) continue;
    const reason = withdrawal.label.split('·')[1]?.trim();
    const month = formatDate(`${current.month}-01`, 'MMMM');
    return `${month.charAt(0).toLocaleUpperCase('pt-BR')}${month.slice(1)} caiu por um resgate de ${whole(Math.abs(withdrawal.amount))}${reason ? ` para o ${reason}` : ''}. É para isso que a reserva existe.`;
  }
  return null;
}

/** Preview of a new goal (amounts in reais while simulating, like the simulator). */
export interface NewGoalPreview {
  missing: number;
  deposits: number;
  firstDeposit: IsoDate;
  reachedOn: YearMonth;
}

export function newGoalTimeline(
  start: YearMonth,
  months: number,
  depositDay: number,
): { firstDeposit: IsoDate; reachedOn: YearMonth } {
  const first = addMonths(start, 1);
  return {
    firstDeposit: `${first}-${String(depositDay).padStart(2, '0')}`,
    reachedOn: addMonths(start, months + 1),
  };
}
