import { colors } from '@guara/ui-tokens';
import { formatCents } from '@guara/utils';
import { Pressable, View } from 'react-native';

import { Badge, Icon, MoneyText, Span, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

import { GOALS_TODAY, type GoalItem } from '../data';
import { horizonText, paceBadge, progressPercent, targetText } from '../lib/goals';

import { GoalBar } from './GoalBar';

const TILE = {
  positive: { box: 'bg-info-muted', icon: colors.info.DEFAULT },
  info: { box: 'bg-info-muted', icon: colors.info.DEFAULT },
  warning: { box: 'bg-surface-muted', icon: colors.foreground.muted },
  negative: { box: 'bg-surface-muted', icon: colors.foreground.muted },
  neutral: { box: 'bg-surface-muted', icon: colors.foreground.muted },
} as const;

/** Goal in "Suas metas": name, where it is kept, state, saved of target and the pace. */
export function GoalCard({ goal, onPress }: { goal: GoalItem; onPress: () => void }) {
  const badge = paceBadge(goal, GOALS_TODAY);
  const percent = progressPercent(goal);
  const tile = TILE[badge.tone];
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${goal.name}: ${badge.label}, ${formatCents(goal.saved, { wholeUnits: true })} de ${targetText(goal.target)}, ${percent}%`}
      onPress={onPress}
      className="gap-3 rounded-22 border border-border bg-surface p-4.5 active:bg-surface-pressed"
    >
      <View className="flex-row items-center gap-3">
        <View className={cn('h-10 w-10 items-center justify-center rounded-12', tile.box)}>
          <Icon name={goal.icon} size={20} color={tile.icon} />
        </View>
        <View className="min-w-0 flex-1">
          <Text size={16} weight="bold" leading={1.3} numberOfLines={2}>
            {goal.name}
          </Text>
          <Text size={13} tone="subtle" leading={1.3} numberOfLines={1}>
            {goal.storage?.label ?? '—'}
          </Text>
        </View>
        <Badge label={badge.label} tone={badge.tone} />
      </View>
      <View className="flex-row items-baseline justify-between gap-2">
        <MoneyText
          value={goal.saved}
          wholeUnits
          serif
          weight="extrabold"
          size={24}
          leading={1.1}
          tracking={-0.01}
        />
        <Text size={14} tone="muted">
          de {targetText(goal.target)} ·{' '}
          <Span weight="bold" tone="default">
            {percent}%
          </Span>
        </Text>
      </View>
      <GoalBar percent={percent} tone={badge.tone} />
      <View className="flex-row justify-between gap-3">
        <Text size={13} tone="muted">
          {goal.monthlyDeposit
            ? `${formatCents(goal.monthlyDeposit, { wholeUnits: true })}/mês`
            : '—'}
        </Text>
        <Text size={13} tone="muted">
          {horizonText(goal)}
        </Text>
      </View>
    </Pressable>
  );
}
