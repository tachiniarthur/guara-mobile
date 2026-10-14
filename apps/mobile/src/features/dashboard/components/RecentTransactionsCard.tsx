import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { StateSlot } from '@/components/feedback';
import { CardHeader } from '@/components/layout';
import { Card, LinkButton, MoneyText, Text } from '@/components/ui';
import { routeTo } from '@/constants/routes';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';

import { RECENT_TRANSACTIONS, TRANSACTIONS_COUNT, type RecentTransaction } from '../data';

function RecentRow({ tx, onPress }: { tx: RecentTransaction; onPress: () => void }) {
  const signed = tx.direction === 'out' ? -tx.amount : tx.amount;
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityHint="Abre o lançamento"
      onPress={onPress}
      className="min-h-12 flex-row items-center gap-3 border-b border-border active:bg-surface-pressed"
    >
      <View
        className={cn(
          'h-9 w-9 items-center justify-center rounded-full border-2',
          tx.flagged
            ? 'border-negative bg-negative-muted'
            : tx.direction === 'in'
              ? 'border-positive bg-surface-muted'
              : 'border-border-strong bg-surface-muted',
        )}
      >
        <Text serif weight="extrabold" size={14} leading={1}>
          {tx.merchant[0]}
        </Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text size={15} weight="semibold" leading={1.3} numberOfLines={1}>
          {tx.merchant}
        </Text>
        <Text
          size={12}
          leading={1.3}
          weight={tx.flagged ? 'bold' : 'regular'}
          tone={tx.flagged ? 'negative' : 'subtle'}
        >
          {tx.detail}
        </Text>
      </View>
      <MoneyText
        value={signed as typeof tx.amount}
        showSign
        size={15}
        weight="bold"
        tone={tx.flagged ? 'negative' : tx.direction === 'in' ? 'positive' : 'default'}
      />
    </Pressable>
  );
}

/** "Últimos lançamentos" on Início. */
export function RecentTransactionsCard() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  return (
    <Card padding={isTablet ? 'lg' : 'md'} className={cn('gap-2.5', isTablet && 'rounded-28')}>
      <CardHeader
        title="Últimos lançamentos"
        size={isTablet ? 22 : 19}
        aside={
          <LinkButton
            label={`Ver os ${TRANSACTIONS_COUNT}`}
            onPress={() => router.navigate('/spending/transactions')}
          />
        }
      />
      <StateSlot>
        <View>
          {RECENT_TRANSACTIONS.map((tx) => (
            <RecentRow
              key={tx.id}
              tx={tx}
              onPress={() => router.navigate(routeTo.transaction(tx.id))}
            />
          ))}
        </View>
      </StateSlot>
    </Card>
  );
}
