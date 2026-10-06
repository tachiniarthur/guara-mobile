import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AppLogo } from '@/components/brand';
import { PageHeader, ResponsiveGrid, Screen, Section, TopBar } from '@/components/layout';
import {
  IconButton,
  LinkButton,
  OptionSheet,
  SegmentedControl,
  SelectPill,
  Span,
  Text,
} from '@/components/ui';
import { AssistantCard, HOME_TEAM, TEAM_CARDS } from '@/features/assistants';
import { useBankConnectionsStore } from '@/features/bank-connections';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { AccountMenuButton, ChatFab } from '@/navigation';
import { useUserStore } from '@/stores';

import {
  AttentionCard,
  BalanceCard,
  CategoryBudgetsCard,
  NewUserHome,
  RecentTransactionsCard,
} from '../components';
import { HOME } from '../data';

type BankView = 'all' | 'byBank';

const MONTHS = [
  { value: '2026-09', label: 'Setembro de 2026', short: 'Set 2026', long: 'Setembro 2026' },
  { value: '2026-08', label: 'Agosto de 2026', short: 'Ago 2026', long: 'Agosto 2026' },
  { value: '2026-07', label: 'Julho de 2026', short: 'Jul 2026', long: 'Julho 2026' },
] as const;

type MonthValue = (typeof MONTHS)[number]['value'];

/** Início: summary of the month, what needs the user, the team and where the money went. */
export function DashboardScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const [bankView, setBankView] = useState<BankView>('all');
  const [month, setMonth] = useState<MonthValue>('2026-09');
  const [monthOpen, setMonthOpen] = useState(false);
  const selectedMonth = MONTHS.find((item) => item.value === month) ?? MONTHS[0];
  const name = useUserStore((state) => state.name);
  // Without a connected bank, Início shows the first steps ("Início · novo").
  const newUser = useBankConnectionsStore((state) => state.connections.length === 0);
  const greeting = `Boa tarde, ${name}.`;

  const subtitle = (
    <Text size={isTablet ? 16 : 15} tone="muted">
      {HOME.dateLabel} ·{' '}
      <Span weight="bold" tone="default">
        {HOME.pendingCount} itens
      </Span>{' '}
      precisam da sua atenção.
    </Text>
  );

  const bankToggle = (
    <SegmentedControl
      accessibilityLabel="Como ver os bancos"
      value={bankView}
      onChange={setBankView}
      options={[
        { value: 'all', label: 'Tudo junto' },
        { value: 'byBank', label: 'Por banco' },
      ]}
    />
  );

  const monthPicker = (
    <SelectPill
      label={isTablet ? selectedMonth.long : selectedMonth.short}
      icon={isTablet ? 'calendar' : undefined}
      accessibilityLabel={`Mês: ${selectedMonth.label.toLowerCase()}`}
      onPress={() => setMonthOpen(true)}
    />
  );

  const teamCards = HOME_TEAM.map((id) => TEAM_CARDS[id]);

  return (
    <View className="flex-1">
      <Screen
        header={
          isTablet ? null : (
            <TopBar
              start={<AppLogo />}
              actions={
                <>
                  <IconButton
                    icon="bell"
                    accessibilityLabel="Notificações, 3 novas"
                    onPress={() => router.navigate('/alerts')}
                  />
                  <AccountMenuButton />
                </>
              }
            />
          )
        }
        contentClassName={isTablet ? 'gap-7 pb-32' : 'gap-6.5 pt-2'}
      >
        {isTablet ? (
          <PageHeader
            title={greeting}
            size={36}
            subtitle={newUser ? undefined : subtitle}
            actions={
              newUser ? null : (
                <>
                  {bankToggle}
                  {monthPicker}
                  <IconButton
                    icon="bell"
                    variant="outline"
                    size={48}
                    accessibilityLabel="Notificações, 3 novas"
                    onPress={() => router.navigate('/alerts')}
                  />
                </>
              )
            }
          />
        ) : (
          <View className="gap-4">
            <View className="gap-1.5">
              <Text variant="display" accessibilityRole="header">
                {greeting}
              </Text>
              {newUser ? null : subtitle}
            </View>
            {newUser ? null : (
              <View className="flex-row items-center justify-between gap-2.5">
                {bankToggle}
                {monthPicker}
              </View>
            )}
          </View>
        )}

        {newUser ? (
          <NewUserHome />
        ) : (
          <>
            <Section
              title="Resumo de setembro"
              description="Como está o seu mês"
              aside={HOME.updatedLabel}
            >
              <View className="gap-4">
                <BalanceCard />
                <AttentionCard />
              </View>
            </Section>

            <Section
              title="Seus assistentes"
              description="Cada um cuida de uma parte do seu dinheiro"
              aside={
                <LinkButton
                  label="Ver assistentes"
                  onPress={() => router.navigate('/assistants')}
                />
              }
            >
              {isTablet ? (
                <ResponsiveGrid columns={{ tablet: 2 }}>
                  {teamCards.map((card) => (
                    <AssistantCard
                      key={card.assistant}
                      card={card}
                      imageHeight={184}
                      className="flex-1"
                    />
                  ))}
                </ResponsiveGrid>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={276 + 12}
                  decelerationRate="fast"
                  className="-mx-4"
                  contentContainerClassName="gap-3 px-4 pb-1"
                >
                  {teamCards.map((card) => (
                    <AssistantCard key={card.assistant} card={card} className="w-[276px]" />
                  ))}
                </ScrollView>
              )}
            </Section>

            <Section
              title="Detalhes de setembro"
              description="Para onde foi o dinheiro"
              aside={
                <LinkButton
                  label="Relatório completo"
                  onPress={() => router.navigate('/reports')}
                />
              }
            >
              <View className="gap-4">
                <CategoryBudgetsCard />
                <RecentTransactionsCard />
              </View>
            </Section>
          </>
        )}
      </Screen>
      {isTablet ? <ChatFab /> : null}
      <OptionSheet
        open={monthOpen}
        onClose={() => setMonthOpen(false)}
        title="Mês"
        value={month}
        onChange={setMonth}
        options={MONTHS}
      />
    </View>
  );
}
