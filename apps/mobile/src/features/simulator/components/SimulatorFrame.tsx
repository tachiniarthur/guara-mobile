import type { ReactNode } from 'react';
import { View } from 'react-native';

import { PageHeader, Screen, TopBar } from '@/components/layout';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ChatFab } from '@/navigation';

import { SimulatorTabs, type SimulationKind } from './SimulatorTabs';

/** Page of the simulator: header, simulation tabs and the blocks of the active simulation. */
export function SimulatorFrame({
  active,
  children,
}: {
  active: SimulationKind;
  children: ReactNode;
}) {
  const { isTablet } = useBreakpoint();
  return (
    <View className="flex-1">
      <Screen
        header={
          isTablet ? null : <TopBar title="Simulador" leading="back" fallbackHref="/investments" />
        }
        contentClassName={isTablet ? 'gap-5 pb-32' : 'gap-4 pt-1'}
      >
        {isTablet ? (
          <PageHeader title="Simulador" subtitle="Cenários com os seus números reais" size={34} />
        ) : null}
        <SimulatorTabs active={active} wide={isTablet} />
        {children}
      </Screen>
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
