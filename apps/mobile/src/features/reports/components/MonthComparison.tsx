import { View } from 'react-native';

import { Icon, MoneyText, Span, Text } from '@/components/ui';
import { toneColor } from '@/theme/tones';

import { COMPARISON, MONTH_COMPARE } from '../data';

/** "Comparado com agosto": category deltas and in/out until the same day. */
export function MonthComparison() {
  return (
    <View className="flex-1 gap-1.5">
      <View>
        {COMPARISON.map((row) => (
          <View
            key={row.category}
            className="min-h-13 flex-row items-center gap-3 border-b border-border"
          >
            <View className="flex-1">
              <Text weight="bold" leading={1.35}>
                {row.category}
              </Text>
              <Text size={13} tone="subtle" leading={1.35}>
                {row.detail}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Icon name={row.icon} size={16} strokeWidth={2} color={toneColor[row.tone]} />
              <Text weight="bold" tone={row.tone}>
                {row.change}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <View className="mt-auto gap-3.5 rounded-16 bg-surface-input p-4">
        <Text variant="caption" tone="subtle">
          Até o dia 23, em cada mês
        </Text>
        {MONTH_COMPARE.map((item) => (
          <View key={item.label} className="gap-1.5">
            <View className="flex-row justify-between gap-3">
              <Text size={14} weight="bold">
                {item.label}
              </Text>
              <Text size={14} weight="bold" tone={item.tone}>
                {item.change}
              </Text>
            </View>
            {[
              {
                label: 'Setembro',
                value: item.current,
                share: 100,
                color: item.color,
                strong: true,
              },
              {
                label: 'Agosto',
                value: item.previous,
                share: item.previousShare,
                color: toneColor.subtle,
                strong: false,
              },
            ].map((bar) => (
              <View key={bar.label} className="flex-row items-center gap-2.5">
                <Text size={13} tone="muted" className="w-16">
                  {bar.label}
                </Text>
                <View className="h-2.5 flex-1 overflow-hidden rounded-5 bg-border">
                  <View
                    className="h-full rounded-5"
                    style={{ width: `${bar.share}%`, backgroundColor: bar.color }}
                  />
                </View>
                <MoneyText
                  value={bar.value}
                  wholeUnits
                  size={13}
                  weight="bold"
                  tone={bar.strong ? 'default' : 'muted'}
                  className="w-24 text-right"
                />
              </View>
            ))}
          </View>
        ))}
        <Text variant="caption" tone="muted">
          Sem a compra de eletrônicos, as saídas ficariam{' '}
          <Span weight="bold" tone="default">
            R$ 238 abaixo
          </Span>{' '}
          de agosto.
        </Text>
      </View>
    </View>
  );
}
