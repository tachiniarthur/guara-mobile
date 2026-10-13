import type { YearMonth } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { formatCents, formatDate, sumCents } from '@guara/utils';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { PageHeader, Screen, SectionCard, TopBar } from '@/components/layout';
import { IconButton, InfoNote, MoneyText, Text } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';
import { ChatFab } from '@/navigation/ChatFab';

import { MonthCalendar, SubscriptionMark } from '../components';
import { useSubscriptions } from '../hooks/useSubscriptions';
import {
  chargesIn,
  dayMonth,
  monthSummary,
  monthTitle,
  nextCharge,
  nextMonth,
  previousMonth,
} from '../lib/subscriptions';

/** "Calendário de cobranças": the month of the next charges, day by day, and the list. */
export function SubscriptionsCalendarScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { items, today } = useSubscriptions();
  const firstMonth = (items[0] ? nextCharge(items[0], today) : today).slice(0, 7) as YearMonth;
  const [month, setMonth] = useState<YearMonth>(firstMonth);
  const charges = chargesIn(items, month);
  const monthName = formatDate(`${month}-01`, 'MMMM');
  const summary = monthSummary(charges);
  const open = (id: string) =>
    router.navigate({
      pathname: '/spending/subscriptions/[subscriptionId]',
      params: { subscriptionId: id },
    });
  const nameOf = (value: YearMonth) => {
    const text = formatDate(`${value}-01`, 'MMMM');
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const calendar = (
    <SectionCard padding={20} gap={14}>
      <View className="flex-row items-center gap-1">
        <IconButton
          icon="chevronLeft"
          accessibilityLabel={nameOf(previousMonth(month))}
          onPress={() => setMonth(previousMonth(month))}
        />
        <Text
          serif
          weight="bold"
          size={20}
          align="center"
          className="flex-1"
          accessibilityRole="header"
        >
          {monthTitle(month)}
        </Text>
        <IconButton
          icon="chevronRight"
          accessibilityLabel={nameOf(nextMonth(month))}
          onPress={() => setMonth(nextMonth(month))}
        />
      </View>
      <MonthCalendar items={items} month={month} />
      <Text size={12} tone="subtle" leading={1.55}>
        {`Hoje é ${dayMonth(today)}. O calendário mostra o mês das próximas cobranças.`}
      </Text>
    </SectionCard>
  );

  const list = (
    <SectionCard
      title={`Cobranças de ${monthName}`}
      description={`${charges.length} ${charges.length === 1 ? 'assinatura' : 'assinaturas'} · ${formatCents(sumCents(charges.map((charge) => charge.amount)))}`}
      titleSize={18}
      padding={22}
      gap={14}
    >
      <View>
        {charges.map((charge, index) => {
          const date = `${month}-${String(charge.day).padStart(2, '0')}`;
          const upcoming = date >= today;
          return (
            <Pressable
              key={charge.item.id}
              accessibilityRole="link"
              onPress={() => open(charge.item.id)}
              className={cn(
                'flex-row items-center gap-3 py-3 active:bg-surface-pressed',
                index < charges.length - 1 && 'border-b border-border',
              )}
            >
              <SubscriptionMark mark={charge.item.mark} size={36} />
              <View className="min-w-0 flex-1">
                <Text weight="medium" leading={1.35}>
                  {charge.item.name}
                </Text>
                <Text size={12} tone="subtle" leading={1.35}>
                  {`${dayMonth(date)} · ${upcoming ? 'próxima cobrança' : 'cobrado'}`}
                </Text>
              </View>
              <MoneyText value={charge.amount} weight="bold" />
            </Pressable>
          );
        })}
      </View>
      {summary ? (
        <InfoNote icon="info" size={13} iconColor={colors.foreground.muted}>
          {summary}
        </InfoNote>
      ) : null}
    </SectionCard>
  );

  return (
    <View className="flex-1">
      <Screen
        header={
          isTablet ? null : (
            <TopBar title="Calendário de cobranças" fallbackHref="/spending/subscriptions" />
          )
        }
        contentClassName={isTablet ? 'gap-5 pb-32' : 'gap-4 pt-1'}
      >
        {isTablet ? (
          <PageHeader
            title="Calendário de cobranças"
            subtitle={monthTitle(month)}
            breadcrumb={{
              parents: [{ label: 'Assinaturas', href: '/spending/subscriptions' }],
              current: 'Calendário',
            }}
          />
        ) : null}
        {calendar}
        {list}
      </Screen>
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
