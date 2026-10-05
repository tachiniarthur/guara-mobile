import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';

import { Chip, SegmentedControl } from '@/components/ui';

import type { SimulationKind } from '../data';

export type { SimulationKind };

const TABS = [
  {
    value: 'retirement',
    label: 'Aposentadoria',
    wideLabel: 'Aposentadoria',
    href: '/investments/simulator',
  },
  {
    value: 'goal',
    label: 'Objetivo',
    wideLabel: 'Juntar para um objetivo',
    href: '/investments/simulator/goal',
  },
  {
    value: 'cut',
    label: 'Cortar gasto',
    wideLabel: 'Cortar um gasto',
    href: '/investments/simulator/cut-expense',
  },
] as const;

/** Simulation type: chips on phones, a full-width segmented control on tablets. */
export function SimulatorTabs({
  active,
  wide = false,
}: {
  active: SimulationKind;
  wide?: boolean;
}) {
  const router = useRouter();
  const open = (kind: SimulationKind) => {
    const tab = TABS.find((item) => item.value === kind);
    if (tab) router.replace(tab.href);
  };

  if (wide) {
    return (
      <SegmentedControl
        options={TABS.map((tab) => ({ value: tab.value, label: tab.wideLabel }))}
        value={active}
        onChange={open}
        appearance="raised"
        fill
        size="md"
        accessibilityLabel="Tipo de simulação"
      />
    );
  }
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      accessibilityLabel="Tipo de simulação"
      contentContainerStyle={{ gap: 8 }}
    >
      {TABS.map((tab) => (
        <Chip
          key={tab.value}
          label={tab.label}
          size={40}
          appearance="filled"
          selected={tab.value === active}
          onPress={() => open(tab.value)}
        />
      ))}
    </ScrollView>
  );
}
