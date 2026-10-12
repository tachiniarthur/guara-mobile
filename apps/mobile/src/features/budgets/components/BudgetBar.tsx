import type { Cents } from '@guara/types';
import { View } from 'react-native';

import { budgetTone } from '@/components/ui';
import { cn } from '@/lib/cn';

const FILL = {
  // A calm month (below 70%) is drawn in Arara-azul.
  positive: 'bg-info',
  warning: 'bg-brand',
  negative: 'bg-negative',
} as const;

export interface BudgetBarProps {
  spent: Cents;
  limit: Cents;
  warnings: readonly Cents[];
  /** 10 dp in the list, 12 dp on the Mata hero. */
  height?: 10 | 12;
  /** Over the Mata texture: dark track and white marks. */
  onHero?: boolean;
}

/** Spending against the cap with a mark at each warning (white once reached). */
export function BudgetBar({ spent, limit, warnings, height = 10, onHero = false }: BudgetBarProps) {
  const percent = (spent / limit) * 100;
  const tone = budgetTone(Math.round(percent));
  const radius = height / 2;
  return (
    <View
      className={onHero ? 'bg-scrim-strong' : 'bg-surface-muted'}
      style={{ height, borderRadius: radius }}
    >
      <View
        className={FILL[tone === 'warning' || tone === 'negative' ? tone : 'positive']}
        style={{ width: `${Math.min(100, percent)}%`, height, borderRadius: radius }}
      />
      {warnings.map((value) => (
        <View
          key={value}
          className={cn(
            'absolute w-0.5 rounded-[1px]',
            onHero || spent >= value ? 'bg-foreground' : 'bg-border-strong',
          )}
          style={{ left: `${(value / limit) * 100}%`, marginLeft: -1, top: -3, height: height + 6 }}
        />
      ))}
    </View>
  );
}
