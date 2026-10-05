import type { Cents } from '@guara/types';
import { Pressable, View } from 'react-native';

import { Badge, MoneyText, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

export interface TransactionRowProps {
  name: string;
  /** "02:14 · Nubank crédito · Eletrônicos". */
  detail: string;
  /** Signed amount (negative = out). */
  amount: Cents;
  /** Out of the pattern: Urucum badge and amount. */
  flagged?: boolean;
  /** Marked as a duplicate: left out of the totals. */
  duplicate?: boolean;
  /** Color of incoming money: Folha (Lançamentos) or Arara-azul (Gastos). */
  incomeTone?: 'positive' | 'info';
  /** Opens the transaction; without it the row is static. */
  onPress?: () => void;
  /** Hide the bottom divider (last row of a card). */
  last?: boolean;
}

/** Transaction line: name, detail, badges and the signed amount. */
export function TransactionRow({
  name,
  detail,
  amount,
  flagged = false,
  duplicate = false,
  incomeTone = 'positive',
  onPress,
  last = false,
}: TransactionRowProps) {
  const content = (
    <>
      <View className="min-w-0 flex-1">
        <Text weight="medium" leading={1.35}>
          {name}
        </Text>
        <Text size={12} tone="subtle" leading={1.35}>
          {detail}
        </Text>
        {flagged || duplicate ? (
          <View className="mt-1 flex-row gap-1.5">
            {flagged ? <Badge label="Fora do padrão" tone="negative" icon="alertTriangle" /> : null}
            {duplicate ? <Badge label="Duplicado" icon="copy" /> : null}
          </View>
        ) : null}
      </View>
      <MoneyText
        value={amount}
        showSign
        weight="bold"
        tone={duplicate ? 'subtle' : flagged ? 'negative' : amount > 0 ? incomeTone : 'default'}
      />
    </>
  );
  const className = cn('flex-row items-center gap-3 py-3', !last && 'border-b border-border');

  if (!onPress) return <View className={className}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityHint="Abre o lançamento"
      onPress={onPress}
      className={cn(className, 'active:bg-surface-pressed')}
    >
      {content}
    </Pressable>
  );
}
