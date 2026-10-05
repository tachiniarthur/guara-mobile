import { View } from 'react-native';

import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

export interface ChargesCalendarProps {
  days: number;
  monthName: string;
  /** Day → names charged that day. */
  charges: ReadonlyMap<number, string[]>;
}

/** Month grid (7 columns) with charge days in Areia. */
export function ChargesCalendar({ days, monthName, charges }: ChargesCalendarProps) {
  const cells = Array.from({ length: days }, (_, index) => index + 1);
  const rows: number[][] = [];
  for (let index = 0; index < cells.length; index += 7) rows.push(cells.slice(index, index + 7));

  return (
    <View className="gap-1">
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row gap-1">
          {Array.from({ length: 7 }, (_, column) => {
            const day = row[column];
            if (day === undefined) return <View key={column} className="flex-1" />;
            const names = charges.get(day);
            return (
              <View
                key={column}
                accessible={Boolean(names)}
                accessibilityLabel={
                  names ? `${day} de ${monthName}: ${names.join(', ')}` : undefined
                }
                importantForAccessibility={names ? 'yes' : 'no-hide-descendants'}
                className={cn(
                  'h-[30px] flex-1 items-center justify-center rounded-8',
                  names && 'bg-foreground',
                )}
              >
                <Text
                  size={12}
                  weight={names ? 'bold' : 'regular'}
                  tone={names ? 'inverse' : 'subtle'}
                >
                  {day}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
