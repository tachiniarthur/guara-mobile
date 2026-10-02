/**
 * Fake data layer (development and tests only). Loaded by `src/lib/api` through
 * `__DEV__ ? require() : null`; screens never import from here.
 */
import type { RawTransport } from '@/lib/api/transport';

import { useMockConfig } from './config';
import { handlers, streamHandlers } from './handlers';
import { createMockTransport as createTransport } from './transport';

export * from './config';
export { sleep, type MockFailure } from './transport';

/** Transport wired to the mock store and the dev settings. */
export function createMockTransport(): RawTransport {
  return createTransport({
    handlers,
    streamHandlers,
    getConfig: () => useMockConfig.getState(),
    getContext: () => ({ db: null, now: new Date() }),
  });
}
