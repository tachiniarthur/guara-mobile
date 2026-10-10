import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppLogo } from '@/components/brand';
import { PageHeader, ResponsiveGrid, Screen, TopBar } from '@/components/layout';
import { IconButton, Text } from '@/components/ui';
import { ASSISTANT_ORDER } from '@/features/chat';
import { bellLabel, useNotifications } from '@/features/notifications';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { AccountMenuButton, ChatFab } from '@/navigation';

import { AssistantCard } from '../components';
import { TEAM_CARDS } from '../data';

const INTRO =
  'Cada um cuida de uma parte do seu dinheiro. Toque em um deles para conversar ou pergunte no chat, que a Capivara chama o certo.';

/** Seus assistentes: the whole team with what each one is doing. */
export function AssistantsScreen() {
  const router = useRouter();
  const { unread } = useNotifications();
  const { isTablet } = useBreakpoint();

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
                    accessibilityLabel={bellLabel(unread)}
                    onPress={() => router.navigate('/notifications')}
                  />
                  <AccountMenuButton />
                </>
              }
            />
          )
        }
        contentClassName={isTablet ? 'pb-32' : 'gap-5 pt-2'}
      >
        {isTablet ? (
          <PageHeader title="Seus assistentes" subtitle={INTRO} />
        ) : (
          <View className="gap-1.5">
            <Text variant="display" accessibilityRole="header">
              Seus assistentes
            </Text>
            <Text size={15} tone="muted">
              {INTRO}
            </Text>
          </View>
        )}
        <ResponsiveGrid columns={{ phone: 1, tablet: 2 }} gap={isTablet ? 16 : 14}>
          {ASSISTANT_ORDER.map((id) => (
            <AssistantCard
              key={id}
              card={TEAM_CARDS[id]}
              imageHeight={isTablet ? 184 : 150}
              className="flex-1"
            />
          ))}
        </ResponsiveGrid>
      </Screen>
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
