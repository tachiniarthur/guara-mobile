import { View } from 'react-native';

import { Badge, MoneyText, Text } from '@/components/ui';

import type { SpendingTransaction } from '../data';

export interface TransactionRowProps {
  transaction: SpendingTransaction;
  /** Append the category to the detail line (tablet). */
  showCategory?: boolean;
}

/** Transaction line: description, date · account, out-of-pattern badge and signed amount. */
export function TransactionRow({ transaction, showCategory = false }: TransactionRowProps) {
  const signed = (
    transaction.direction === 'out' ? -transaction.amount : transaction.amount
  ) as typeof transaction.amount;
  return (
    <View className="flex-row items-start gap-3 border-b border-border py-3">
      <View className="min-w-0 flex-1">
        <Text weight="medium" leading={1.35}>
          {transaction.description}
        </Text>
        <Text size={12} tone="subtle" leading={1.35}>
          {showCategory ? `${transaction.detail} · ${transaction.category}` : transaction.detail}
        </Text>
        {transaction.flagged ? (
          <View className="mt-1 flex-row">
            <Badge label="Fora do padrão" tone="negative" icon="eye" />
          </View>
        ) : null}
      </View>
      <MoneyText
        value={signed}
        showSign
        weight="bold"
        tone={
          transaction.flagged ? 'negative' : transaction.direction === 'in' ? 'info' : 'default'
        }
      />
    </View>
  );
}
