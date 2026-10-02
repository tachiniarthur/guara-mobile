import { create } from 'zustand';

export const MOCK_SCENARIOS = ['complete', 'new_user', 'errors'] as const;
export type MockScenarioName = (typeof MOCK_SCENARIOS)[number];

export interface MockConfig {
  scenario: MockScenarioName;
  /** Delay added to every request. */
  latencyMs: number;
  /** Probability (0–1) of a random `unavailable` error on any request. */
  errorRate: number;
  /** How long a simulated timeout hangs before failing. */
  timeoutMs: number;
}

export const DEFAULT_MOCK_CONFIG: MockConfig = {
  scenario: 'complete',
  // Tests run without delay; the app gets a little latency so loading states show up.
  latencyMs: process.env.NODE_ENV === 'test' ? 0 : 300,
  errorRate: 0,
  timeoutMs: 5_000,
};

/** Dev-only settings of the fake data layer (changed by the /dev/data panel). */
export const useMockConfig = create<MockConfig>(() => ({ ...DEFAULT_MOCK_CONFIG }));
