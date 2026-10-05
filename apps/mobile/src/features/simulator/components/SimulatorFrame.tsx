import type { ReactNode } from 'react';
import { View } from 'react-native';

import { PageHeader, Screen, TopBar } from '@/components/layout';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ChatFab } from '@/navigation';

import { SimulatorTabs, type SimulationKind } from './SimulatorTabs';

/** Tablet subtitle of each simulation. */
const SUBTITLES: Record<SimulationKind, string> = {
  retirement: 'Cenários com os seus números reais',
  goal: 'Planeje um objetivo com prazo e valor',
  cut: 'Veja quanto um corte rende ao longo do tempo',
};

/** Page of the simulator: header, simulation tabs and the blocks of the active simulation. */
export function SimulatorFrame({
  active,
  notice,
  children,
}: {
  active: SimulationKind;
  /** Under the tabs ("Aberta de uma simulação salva…"). */
  notice?: ReactNode;
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
        {isTablet ? <PageHeader title="Simulador" subtitle={SUBTITLES[active]} size={34} /> : null}
        <SimulatorTabs active={active} wide={isTablet} />
        {notice}
        {children}
      </Screen>
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
