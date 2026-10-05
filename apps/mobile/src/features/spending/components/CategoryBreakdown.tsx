import { colors } from '@guara/ui-tokens';
import { Pressable, View } from 'react-native';

import { DonutChart } from '@/components/charts';
import { Icon, MoneyText, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

import { CATEGORY_TOTALS, SPENDING } from '../data';

export interface CategoryBreakdownProps {
  /** Tablet: donut beside the list and shares in the captions. */
  wide?: boolean;
  onSelect?: (category: string) => void;
}

/** Donut of the month's spending by category + the tappable list. */
export function CategoryBreakdown({ wide = false, onSelect }: CategoryBreakdownProps) {
  const segments = [
    ...CATEGORY_TOTALS.map((item) => ({ key: item.name, value: item.total, color: item.color })),
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
            value={SPENDING.totalOut}
            wholeUnits
            serif
            weight="extrabold"
            size={20}
            tracking={-0.01}
          />
        </DonutChart>
      </View>
      <View className={cn(wide && 'min-w-0 flex-1')}>
        {CATEGORY_TOTALS.map((item) => (
          <Pressable
            key={item.name}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, ${item.count} lançamentos`}
            onPress={() => onSelect?.(item.name)}
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
                {wide ? ` · ${item.share}%` : ''}
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
