import { Pressable, View } from 'react-native';

import { Icon, RadioDot, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';
import { toneColor } from '@/theme/tones';

export interface AlertKindOptionProps {
  kind: 'buy' | 'sell';
  selected: boolean;
  onPress: () => void;
}

const COPY = {
  buy: {
    label: 'COMPRA',
    hint: 'Avise quando o preço cair até',
    icon: 'arrowDown',
    tone: 'positive',
  },
  sell: {
    label: 'VENDA',
    hint: 'Avise quando o preço subir até',
    icon: 'arrowUp',
    tone: 'negative',
  },
} as const;

/** Buy or sell alert option (selected: tinted with a 2px border). */
export function AlertKindOption({ kind, selected, onPress }: AlertKindOptionProps) {
  const copy = COPY[kind];
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${copy.label}: ${copy.hint}`}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      className={cn(
        'min-h-16 flex-row items-center gap-3 rounded-20 px-3.5 py-2.5',
        selected
          ? kind === 'sell'
            ? 'border-2 border-negative bg-negative-muted'
            : 'border-2 border-positive bg-positive-muted'
          : 'border border-border-strong bg-surface-input',
      )}
    >
      <RadioDot checked={selected} />
      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          <Icon name={copy.icon} size={16} strokeWidth={2.2} color={toneColor[copy.tone]} />
          <Text weight="bold" tone={copy.tone} leading={1.35}>
            {copy.label}
          </Text>
        </View>
        <Text size={13} tone="muted" leading={1.35}>
          {copy.hint}
        </Text>
      </View>
    </Pressable>
  );
}
