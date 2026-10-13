import { useRouter, type Href } from 'expo-router';
import { View } from 'react-native';

import { CardHeader } from '@/components/layout';
import { Button, Card, CountBadge, Text, useMoneyFormat } from '@/components/ui';
import { RingedPortrait } from '@/features/chat';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';

import { ATTENTION_ITEMS, type AttentionItemData } from '../data';

const ITEM_HREF: Record<string, Href> = {
  'unusual-purchase': '/alerts',
  'transport-budget': '/spending',
  'netflix-raise': '/spending/subscriptions',
};

function AttentionItem({ item }: { item: AttentionItemData }) {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { mask } = useMoneyFormat();
  return (
    <View
      className={cn(
        'flex-row items-center gap-3 rounded-16 px-2.5 py-2',
        item.urgent ? 'bg-negative-muted' : 'bg-surface-muted',
      )}
    >
      <RingedPortrait assistant={item.assistant} />
      <View className="min-w-0 flex-1">
        <Text size={15} weight="bold" leading={1.3} numberOfLines={isTablet ? 1 : undefined}>
          {mask(item.title)}
        </Text>
        <Text size={13} tone="muted" leading={1.3} numberOfLines={isTablet ? 1 : undefined}>
          {mask(item.detail)}
        </Text>
        <Text size={12} weight="bold" tone={item.urgent ? 'negative' : 'subtle'} leading={1.3}>
          {item.source}
        </Text>
      </View>
      <Button
        size="md"
        variant={item.urgent ? 'primary' : 'outline'}
        className={isTablet ? 'px-5' : undefined}
        onPress={() => router.navigate(ITEM_HREF[item.id] ?? '/alerts')}
        accessibilityLabel={`${item.action}: ${mask(item.title)}`}
      >
        {item.action}
      </Button>
    </View>
  );
}

/** "Precisa de você": what the team needs the user to look at. */
export function AttentionCard() {
  const { isTablet } = useBreakpoint();
  return (
    <Card padding={isTablet ? 'lg' : 'md'} className={cn('gap-3.5', isTablet && 'rounded-28')}>
      <CardHeader
        title="Precisa de você"
        size={isTablet ? 22 : 19}
        adornment={
          <CountBadge
            count={ATTENTION_ITEMS.length}
            accessibilityLabel={`${ATTENTION_ITEMS.length} pendências`}
          />
        }
      />
      <View className="gap-2">
        {ATTENTION_ITEMS.map((item) => (
          <AttentionItem key={item.id} item={item} />
        ))}
      </View>
    </Card>
  );
}
