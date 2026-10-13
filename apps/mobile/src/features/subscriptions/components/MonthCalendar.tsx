import type { YearMonth } from '@guara/types';
import { formatCents, formatDate } from '@guara/utils';
import { View } from 'react-native';

import { Text } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';
import { toneColor } from '@/theme/tones';

import type { SubscriptionItem } from '../data';
import { chargesIn, daysInMonth, firstWeekday } from '../lib/subscriptions';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * "Calendário de cobranças": a week per row, the charge days tinted with a dot in the color of
 * each subscription (tablet: name and amount too).
 */
export function MonthCalendar({
  items,
  month,
}: {
  items: readonly SubscriptionItem[];
  month: YearMonth;
}) {
  const { isTablet } = useBreakpoint();
  const charges = chargesIn(items, month);
  const monthName = formatDate(`${month}-01`, 'MMMM');
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday(month) }, () => null),
    ...Array.from({ length: daysInMonth(month) }, (_, index) => index + 1),
  ];
  const weeks: (number | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));

  return (
    <View
      role="grid"
      accessibilityLabel={formatDate(`${month}-01`, "MMMM 'de' yyyy")}
      className="gap-1"
    >
      <View className="flex-row gap-1">
        {WEEKDAYS.map((name) => (
          <Text key={name} size={12} weight="bold" tone="subtle" align="center" className="flex-1">
            {name}
          </Text>
        ))}
      </View>
      {weeks.map((week, row) => (
        <View key={row} className="flex-row gap-1">
          {Array.from({ length: 7 }, (_, column) => {
            const day = week[column] ?? null;
            // Same box as a day (padding and border), so every column keeps the same width.
            if (day === null) {
              return <View key={column} className="min-w-0 flex-1 border border-transparent p-2" />;
            }
            const today = charges.filter((charge) => charge.day === day);
            const label = today.length
              ? `${day} de ${monthName}: ${today.map((charge) => `${charge.item.name}, ${formatCents(charge.amount)}`).join('; ')}`
              : undefined;
            return (
              <View
                key={column}
                accessible={Boolean(label)}
                accessibilityLabel={label}
                importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
                className={cn(
                  'min-w-0 flex-1 gap-1.5 rounded-14 border border-border p-2',
                  today.length ? 'bg-surface-muted' : 'bg-transparent',
                )}
                style={{ minHeight: isTablet ? 92 : 48, borderRadius: 14 }}
              >
                <Text
                  size={13}
                  weight={today.length ? 'extrabold' : 'medium'}
                  tone={today.length ? 'default' : 'subtle'}
                >
                  {day}
                </Text>
                {today.map((charge) =>
                  isTablet ? (
                    <View key={charge.item.id} className="gap-1">
                      <View className="flex-row items-center gap-1.5">
                        <View
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: toneColor[charge.item.tone] }}
                        />
                        <Text size={12} weight="bold" numberOfLines={1} className="flex-1">
                          {charge.item.name}
                        </Text>
                      </View>
                      <Text size={12} tone="muted" tabular numberOfLines={1}>
                        {formatCents(charge.amount)}
                      </Text>
                    </View>
                  ) : (
                    <View
                      key={charge.item.id}
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: toneColor[charge.item.tone] }}
                    />
                  ),
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
