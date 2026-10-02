/**
 * In-memory state of the fake API. Built lazily from the selected scenario; mutations
 * change it until the app reloads, the scenario changes or `resetMockData()` runs.
 */
import type { EndpointName, StreamEndpointName } from '@guara/types';

import { useMockConfig, type MockScenarioName } from './config';
import type { MockDb } from './db';
import { SCENARIOS } from './scenarios';
import type { MockFailure } from './transport';

let state: { scenario: MockScenarioName; db: MockDb } | null = null;

export function getMockDb(): MockDb {
  const { scenario } = useMockConfig.getState();
  if (!state || state.scenario !== scenario) {
    state = { scenario, db: SCENARIOS[scenario].build() };
  }
  return state.db;
}

/** Discards every change and rebuilds the current scenario on the next request. */
export function resetMockData(): void {
  state = null;
}

export function setMockScenario(scenario: MockScenarioName): void {
  useMockConfig.setState({ scenario });
  state = null;
}

export function getScenarioFailure(
  name: EndpointName | StreamEndpointName,
): MockFailure | undefined {
  return SCENARIOS[useMockConfig.getState().scenario].failures[name];
}
