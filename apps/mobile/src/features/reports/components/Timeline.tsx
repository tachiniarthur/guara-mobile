import { View } from 'react-native';

import { Badge, MoneyText, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

import type { TimelineEvent } from '../data';

export interface TimelineProps {
  events: readonly TimelineEvent[];
  /** Width of the date column (design: 48 phone, 56 tablet). */
  dateWidth?: number;
}

/** "Linha do tempo": dates, a vertical rail with dots and the biggest moves. */
export function Timeline({ events, dateWidth = 48 }: TimelineProps) {
  const gap = dateWidth === 48 ? 10 : 12;
  return (
    <View>
      <View
        className="absolute bottom-4 top-4 w-0.5 bg-border"
        style={{ left: dateWidth + gap + 9 }}
      />
      {events.map((event) => {
        const signed = (
          event.direction === 'out' ? -event.amount : event.amount
        ) as typeof event.amount;
        return (
          <View key={event.id} className="flex-row items-start py-2.5" style={{ gap }}>
            <Text size={13} tone="subtle" tabular style={{ width: dateWidth, paddingTop: 2 }}>
              {event.date}
            </Text>
            <View className="w-5 items-center">
              <View
                className={cn(
                  'mt-[5px] h-3 w-3 rounded-full border-2 bg-surface',
                  event.flagged
                    ? 'border-negative'
                    : event.direction === 'in'
                      ? 'border-info'
                      : 'border-border-strong',
                )}
              />
            </View>
            <View className="min-w-0 flex-1">
              <Text weight="bold" leading={1.35}>
                {event.title}
              </Text>
              <Text size={13} tone="subtle" leading={1.35}>
                {event.detail}
              </Text>
              {event.flagged ? (
                <View className="mt-1 flex-row">
                  <Badge label="Fora do padrão" tone="negative" icon="eye" />
                </View>
              ) : null}
            </View>
            <MoneyText
              value={signed}
              showSign
              weight="bold"
              tone={event.flagged ? 'negative' : event.direction === 'in' ? 'info' : 'default'}
            />
          </View>
        );
      })}
    </View>
  );
}
