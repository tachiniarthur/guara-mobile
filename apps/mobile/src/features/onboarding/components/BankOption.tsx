import { colors } from '@guara/ui-tokens';
import { Pressable, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';

export interface BankOptionProps {
  name: string;
  mark: string;
  connected: boolean;
  onPress: () => void;
}

/** Bank pill: logo tile, name and "Conectar" / "✓ Conectado". */
export function BankOption({ name, mark, connected, onPress }: BankOptionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${connected ? 'conectado' : 'conectar'}`}
      accessibilityState={{ selected: connected }}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      className={cn(
        'min-h-[60px] flex-row items-center gap-3 rounded-full px-3.5',
        connected
          ? 'border-2 border-positive bg-positive-muted'
          : 'border border-border-strong bg-surface-input active:bg-surface-pressed',
      )}
    >
      <View className="h-[34px] w-[34px] items-center justify-center rounded-10 border border-border bg-background">
        <Text serif weight="bold" size={14} leading={1}>
          {mark}
        </Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text size={15} weight="bold" leading={1.3} numberOfLines={1}>
          {name}
        </Text>
        {connected ? (
          <View className="flex-row items-center gap-1">
            <Icon name="check" size={14} strokeWidth={2.4} color={colors.positive.DEFAULT} />
            <Text size={12} weight="bold" tone="positive" leading={1.3}>
              Conectado
            </Text>
          </View>
        ) : (
          <Text size={12} tone="subtle" leading={1.3}>
            Conectar
          </Text>
        )}
      </View>
    </Pressable>
  );
}
