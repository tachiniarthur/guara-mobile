import type { BudgetStatus, CategoryId } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { formatCents } from '@guara/utils';
import { Pressable, View } from 'react-native';

import { Badge, Icon, Span, Text, type BadgeTone, type IconName } from '@/components/ui';
import { cn } from '@/lib/cn';

import { budgetLine, STATUS_LABEL, type BudgetView } from '../lib/budgets';

import { BudgetBar } from './BudgetBar';

export const STATUS_TONE: Record<BudgetStatus, BadgeTone> = {
  ok: 'positive',
  warning: 'brand',
  exceeded: 'negative',
};

const CATEGORY_ICON: Partial<Record<CategoryId, IconName>> = {
  food: 'tag',
  transport: 'car',
  leisure: 'star',
  housing: 'home',
  subscriptions: 'repeat',
};

export const categoryIcon = (categoryId: string): IconName =>
  CATEGORY_ICON[categoryId as CategoryId] ?? 'tag';

/** "No ritmo", "Perto do teto" or "Estourou". */
export function BudgetStatusBadge({ status }: { status: BudgetStatus }) {
  return <Badge label={STATUS_LABEL[status]} tone={STATUS_TONE[status]} />;
}

const whole = (value: number) => formatCents(value, { wholeUnits: true });

/** A cap in "Tetos do mês": spent, status, the bar with its warnings and how the month goes. */
export function BudgetRow({
  budget,
  onPress,
  last,
}: {
  budget: BudgetView;
  onPress: () => void;
  last: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${budget.label}: ${formatCents(budget.spent)} de ${formatCents(budget.limit)}, ${STATUS_LABEL[budget.status]}. ${budgetLine(budget)}`}
      onPress={onPress}
      className={cn('gap-2.5 py-4 active:bg-surface-pressed', !last && 'border-b border-border')}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-12 bg-surface-muted">
          <Icon name={categoryIcon(budget.categoryId)} size={18} color={colors.foreground.muted} />
        </View>
        <View className="min-w-0 flex-1">
          <Text size={16} weight="bold" leading={1.35}>
            {budget.label}
          </Text>
          <Text size={13} tone="muted" tabular leading={1.35}>
            <Span weight="bold" tone="default">
              {formatCents(budget.spent)}
            </Span>{' '}
            de {formatCents(budget.limit)}
          </Text>
        </View>
        <BudgetStatusBadge status={budget.status} />
      </View>
      <BudgetBar spent={budget.spent} limit={budget.limit} warnings={budget.warnings} />
      <View className="flex-row flex-wrap items-center justify-between gap-2.5">
        <View className="flex-row flex-wrap items-center gap-3">
          {budget.warnings.map((value) =>
            budget.spent >= value ? (
              <Text key={value} size={12} weight="bold" tone="positive">
                {`✓ ${whole(value)}`}
              </Text>
            ) : (
              <Text key={value} size={12} weight="medium" tone="subtle">
                {whole(value)}
              </Text>
            ),
          )}
          <Text size={12} tone="subtle">
            {`teto ${whole(budget.limit)}`}
          </Text>
        </View>
        <Text size={13} tone="muted" align="right" className="flex-shrink">
          {budgetLine(budget)}
        </Text>
      </View>
    </Pressable>
  );
}
