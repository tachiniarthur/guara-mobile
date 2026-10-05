import { colors } from '@guara/ui-tokens';
import { Pressable, View } from 'react-native';

import { DonutChart } from '@/components/charts';
import { Icon, MoneyText, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

import type { CategoryId, Cents } from '@guara/types';

import { SPENDING, type CategoryTotal } from '../data';

export interface CategoryBreakdownProps {
  /** Biggest categories of the month (with the user's edits). */
  items: readonly CategoryTotal[];
  /** All outflows of the month (donut center and shares). */
  totalOut: Cents;
  /** Tablet: donut beside the list and shares in the captions. */
  wide?: boolean;
  onSelect?: (category: CategoryId) => void;
}

/** Donut of the month's spending by category + the tappable list. */
export function CategoryBreakdown({
  items,
  totalOut,
  wide = false,
  onSelect,
}: CategoryBreakdownProps) {
  const segments = [
    ...items.map((item) => ({ key: item.name, value: item.total, color: item.color })),
    { key: 'Outros', value: SPENDING.othersTotal, color: colors.border.strong },
  ];

  return (
    <View className={cn(wide ? 'flex-row items-center gap-7' : 'gap-2')}>
      <View className={cn(!wide && 'items-center')}>
        <DonutChart segments={segments} size={wide ? 160 : 180}>
          <Text size={12} tone="subtle">
            Saídas
          </Text>
          <MoneyText
            value={totalOut}
            wholeUnits
            serif
            weight="extrabold"
            size={20}
            tracking={-0.01}
          />
        </DonutChart>
      </View>
      <View className={cn(wide && 'min-w-0 flex-1')}>
        {items.map((item) => (
          <Pressable
            key={item.name}
            accessibilityRole="link"
            accessibilityLabel={`${item.name}, ${item.count} lançamentos`}
            onPress={() => onSelect?.(item.id)}
            className={cn(
              'flex-row items-center gap-3 border-b border-border active:bg-surface-pressed',
              wide ? 'min-h-13' : 'min-h-14',
            )}
          >
            <View
              className="w-2.5 rounded-[3px]"
              style={{ height: wide ? 26 : 28, backgroundColor: item.color }}
            />
            <View className="min-w-0 flex-1">
              <Text weight="bold" leading={1.3}>
                {item.name}
              </Text>
              <Text size={12} tone="subtle" leading={1.3}>
                {item.count} {item.count === 1 ? 'lançamento' : 'lançamentos'}
                {wide ? ` · ${Math.round((item.total / totalOut) * 100)}%` : ''}
              </Text>
            </View>
            <MoneyText value={item.total} weight="bold" />
            <Icon name="chevronRight" size={16} color={colors.foreground.subtle} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
