import { formatDateTime } from '@guara/utils';
import { useQueryClient } from '@tanstack/react-query';
import { RotateCcw } from 'lucide-react-native';
import { View } from 'react-native';

import { toast } from '@/components/feedback';
import { Header, Screen, Section } from '@/components/layout';
import { Button, Card, SegmentedControl, Text } from '@/components/ui';
import { env } from '@/lib/env';
import {
  MOCK_NOW,
  MOCK_SCENARIOS,
  SCENARIOS,
  resetMockData,
  setMockScenario,
  useMockConfig,
  type MockScenarioName,
} from '@/mocks';

const LATENCIES = [
  { value: '0', label: '0' },
  { value: '300', label: '300 ms' },
  { value: '1500', label: '1,5 s', accessibilityLabel: '1,5 segundo' },
] as const;

const ERROR_RATES = [
  { value: '0', label: '0%' },
  { value: '0.1', label: '10%' },
  { value: '0.3', label: '30%' },
] as const;

const SCENARIO_OPTIONS = MOCK_SCENARIOS.map((value) => ({
  value,
  label: SCENARIOS[value].shortLabel,
  accessibilityLabel: SCENARIOS[value].label,
}));

/** Development-only controls of the fake data layer (route `/dev/data`). */
export function DataPanelScreen() {
  const queryClient = useQueryClient();
  const scenario = useMockConfig((state) => state.scenario);
  const latencyMs = useMockConfig((state) => state.latencyMs);
  const errorRate = useMockConfig((state) => state.errorRate);

  // Every screen refetches from the new data (active queries run again).
  const refreshScreens = () => queryClient.resetQueries();

  const changeScenario = (next: MockScenarioName) => {
    setMockScenario(next);
    void refreshScreens();
    toast.info(`Cenário: ${SCENARIOS[next].label}`);
  };

  const resetAll = () => {
    resetMockData();
    void refreshScreens();
    toast.success('Dados falsos reiniciados e cache limpo');
  };

  return (
    <Screen scroll contentClassName="gap-6 pb-12">
      <Header title="Dados falsos" subtitle="Somente em desenvolvimento" large />

      {env.dataSource === 'api' ? (
        <Card variant="outline">
          <Text variant="body" tone="warning">
            O app está usando a API (EXPO_PUBLIC_DATA_SOURCE=api). Estes controles só valem para os
            dados falsos.
          </Text>
        </Card>
      ) : null}

      <Section title="Cenário">
        <SegmentedControl
          options={SCENARIO_OPTIONS}
          value={scenario}
          onChange={changeScenario}
          accessibilityLabel="Cenário dos dados falsos"
        />
        <Text variant="caption" tone="muted">
          {SCENARIOS[scenario].description}
        </Text>
      </Section>

      <Section title="Latência">
        <SegmentedControl
          options={LATENCIES}
          value={String(latencyMs) as (typeof LATENCIES)[number]['value']}
          onChange={(value) => useMockConfig.setState({ latencyMs: Number(value) })}
          accessibilityLabel="Latência de cada requisição"
        />
      </Section>

      <Section title="Taxa de erro">
        <SegmentedControl
          options={ERROR_RATES}
          value={String(errorRate) as (typeof ERROR_RATES)[number]['value']}
          onChange={(value) => useMockConfig.setState({ errorRate: Number(value) })}
          accessibilityLabel="Chance de erro aleatório em cada requisição"
        />
        <Text variant="caption" tone="muted">
          Erros aleatórios respondem 503 (serviço indisponível), que o app tenta de novo.
        </Text>
      </Section>

      <View className="gap-3">
        <Button variant="secondary" leftIcon={RotateCcw} onPress={resetAll} fullWidth>
          Reiniciar dados e limpar cache
        </Button>
        <Text variant="caption" tone="subtle" align="center">
          Relógio do mundo falso: {formatDateTime(MOCK_NOW)}
        </Text>
      </View>
    </Screen>
  );
}
