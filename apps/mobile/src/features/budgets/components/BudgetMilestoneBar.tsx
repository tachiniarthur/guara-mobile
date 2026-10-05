import type { Cents } from '@guara/types';
import { formatCents } from '@guara/utils';
import { useState } from 'react';
import { View } from 'react-native';

import { budgetTone, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

const FILL: Record<string, string> = {
  // A calm month (below 70%) is drawn in Arara-azul.
  positive: 'bg-info',
  warning: 'bg-warning',
  negative: 'bg-negative',
};

export interface BudgetMilestoneBarProps {
  spent: Cents;
  limit: Cents;
  /** Warning points already configured (e.g. R$ 500 and R$ 700). */
  milestones?: readonly Cents[];
}

const amount = (value: Cents) => formatCents(value, { wholeUnits: true, hideSymbol: true });

/** Spending bar with the cap's warning marks ("✓ 500", "✓ 700", "teto 1.000"). */
export function BudgetMilestoneBar({ spent, limit, milestones = [] }: BudgetMilestoneBarProps) {
  const [width, setWidth] = useState(0);
  const percent = Math.min(100, (spent / limit) * 100);
  const tone = budgetTone(Math.round((spent / limit) * 100));
  const marks = [
    ...milestones.map((value) => ({
      value,
      label: `${spent >= value ? '✓ ' : ''}${amount(value)}`,
      reached: spent >= value,
      cap: false,
    })),
    { value: limit, label: `teto ${amount(limit)}`, reached: false, cap: true },
  ];

  return (
    <View
      accessible
      accessibilityLabel={`${formatCents(spent)} de ${formatCents(limit)}. Avisos em ${milestones.map(amount).join(' e ')}`}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      className="h-[34px]"
    >
      <View className="absolute left-0 right-0 top-0 h-2.5 rounded-5 bg-border" />
      <View
        className={cn('absolute left-0 top-0 h-2.5 rounded-5', FILL[tone] ?? 'bg-info')}
        style={{ width: `${percent}%` }}
      />
      {width > 0
        ? marks.map((mark) => {
            const x = (mark.value / limit) * width;
            return (
              <View key={mark.value}>
                <View
                  className={cn(
                    'absolute h-4 w-0.5 rounded-[1px]',
                    mark.reached ? 'bg-foreground' : 'bg-border-strong',
                  )}
                  style={{ top: -3, left: x - 1 }}
                />
                <Text
                  size={12}
                  tabular
                  tone={mark.reached ? 'muted' : 'subtle'}
                  numberOfLines={1}
                  style={{
                    position: 'absolute',
                    top: 16,
                    width: 90,
                    left: mark.cap ? x - 90 : x - 45,
                    textAlign: mark.cap ? 'right' : 'center',
                  }}
                >
                  {mark.label}
                </Text>
              </View>
            );
          })
        : null}
    </View>
  );
}
