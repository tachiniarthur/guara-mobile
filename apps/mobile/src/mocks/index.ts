/**
 * Fake data layer (development and tests only). Loaded by `src/lib/api` through
 * `__DEV__ ? require() : null`; screens never import from here.
 */
import type { RawTransport } from '@/lib/api/transport';

import { useMockConfig } from './config';
import { handlers, streamHandlers } from './handlers';
import { getMockDb, getScenarioFailure } from './store';
import { createMockTransport as createTransport } from './transport';

export * from './config';
export { MOCK_NOW } from './clock';
export { SCENARIOS, type MockScenario } from './scenarios';
export { getMockDb, resetMockData, setMockScenario } from './store';
export { sleep, type MockFailure } from './transport';

/** Transport wired to the mock store, the selected scenario and the dev settings. */
export function createMockTransport(): RawTransport {
  return createTransport({
    handlers,
    streamHandlers,
    getConfig: () => useMockConfig.getState(),
    getContext: () => {
      const db = getMockDb();
      return { db, now: new Date(db.clock) };
    },
    getFailure: getScenarioFailure,
  });
}
