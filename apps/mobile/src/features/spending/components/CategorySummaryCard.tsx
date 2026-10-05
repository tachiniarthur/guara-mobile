import type { CategoryMonthSummary } from '@guara/types';
import { formatCents, formatCentsForSpeech } from '@guara/utils';
import { View } from 'react-native';

import { EmptyValue, MoneyText, Span, Text, budgetTone } from '@/components/ui';
import { cn } from '@/lib/cn';

import { budgetCaption, budgetStateText, previousMonthName } from '../lib/format';

const FILL = { positive: 'bg-info', warning: 'bg-warning', negative: 'bg-negative' } as const;

export interface CategorySummaryCardProps {
  /** "Alimentação". */
  label: string;
  /** "setembro". */
  monthName: string;
  /** `null` when the month figures of the category are unknown. */
  summary: CategoryMonthSummary | null;
}

/** Total of the category in the month, comparison and the cap with its warnings. */
export function CategorySummaryCard({ label, monthName, summary }: CategorySummaryCardProps) {
  const count = summary?.count;
  const budget = summary?.budget ?? null;
  const change = summary?.changePercent ?? null;
  const percent = budget ? Math.min(100, budget.usedPercent) : 0;
  const tone = budget ? budgetTone(Math.round(budget.usedPercent)) : 'positive';
  const fill = FILL[tone === 'warning' || tone === 'negative' ? tone : 'positive'];

  return (
    <View className="min-w-0 gap-2.5 rounded-24 border border-border bg-surface p-4.5">
      <Text size={14} tone="muted">
        {label} em {monthName}
        {count === undefined ? '' : ` · ${count} ${count === 1 ? 'lançamento' : 'lançamentos'}`}
      </Text>
      {summary ? (
        <MoneyText
          value={summary.spent}
          serif
          weight="extrabold"
          size={34}
          leading={1.1}
          tracking={-0.01}
        />
      ) : (
        <EmptyValue serif weight="extrabold" size={34} />
      )}
      {summary ? (
        <Text size={14} tone="muted">
          {Math.round(summary.shareOfOutflows)}% das saídas
          {change !== null && summary.previousMonthSpent !== null ? (
            <>
              {' · '}
              <Span weight="bold" tone={change > 0 ? 'negative' : 'positive'}>
                {change > 0 ? '+' : '−'}
                {Math.abs(Math.round(change))}%
              </Span>{' '}
              que {previousMonthName(summary)} (
              {formatCents(summary.previousMonthSpent, { wholeUnits: true })})
            </>
          ) : null}
        </Text>
      ) : null}
      {budget ? (
        <View className="gap-2">
          <View className="flex-row justify-between gap-3">
            <Text size={14} tone="muted">
              Teto de {formatCents(budget.limit, { wholeUnits: true })}
            </Text>
            <Text size={14} weight="bold">
              {budgetStateText(budget.usedPercent)}
            </Text>
          </View>
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={`${formatCentsForSpeech(summary!.spent)} de ${formatCentsForSpeech(budget.limit)}`}
            accessibilityValue={{ min: 0, max: 100, now: Math.round(percent) }}
            className="h-2.5"
          >
            <View className="absolute inset-x-0 top-0 h-2.5 rounded-5 bg-surface-muted" />
            <View
              className={cn('absolute left-0 top-0 h-2.5 rounded-5', fill)}
              style={{ width: `${percent}%` }}
            />
            {budget.warnings.map((value) => (
              <View
                key={value}
                className="absolute h-4 w-0.5 rounded-[1px] bg-foreground"
                style={{ top: -3, left: `${(value / budget.limit) * 100}%`, marginLeft: -1 }}
              />
            ))}
          </View>
          <Text size={12} tone="subtle">
            {budgetCaption(budget)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
