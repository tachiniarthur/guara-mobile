import { View } from 'react-native';

import { PageHeader, Screen, TopBar } from '@/components/layout';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ChatFab } from '@/navigation';

import { PropertiesCard } from '../components';

/** "Bens": real estate and vehicles of the net worth (the same card as in Investimentos). */
export function PropertiesScreen() {
  const { isTablet } = useBreakpoint();
  return (
    <View className="flex-1">
      <Screen
        header={isTablet ? null : <TopBar title="Bens" fallbackHref="/investments" />}
        contentClassName={isTablet ? 'gap-5 pb-32' : 'gap-4 pt-1'}
      >
        {isTablet ? (
          <PageHeader
            title="Bens"
            breadcrumb={{
              parents: [{ label: 'Investimentos', href: '/investments' }],
              current: 'Bens',
            }}
          />
        ) : null}
        <PropertiesCard />
      </Screen>
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
