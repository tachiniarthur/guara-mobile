import { parseEnv } from '../env';

const dev = { variant: 'development', isDev: true } as const;

describe('parseEnv', () => {
  it('uses mock data by default in development and the API elsewhere', () => {
    expect(parseEnv({}, dev).dataSource).toBe('mock');
    expect(parseEnv({}, { variant: 'production', isDev: false }).dataSource).toBe('api');
    expect(parseEnv({}, { variant: 'preview', isDev: false }).dataSource).toBe('api');
  });

  it('honours EXPO_PUBLIC_DATA_SOURCE', () => {
    expect(parseEnv({ EXPO_PUBLIC_DATA_SOURCE: 'api' }, dev).dataSource).toBe('api');
    expect(parseEnv({ EXPO_PUBLIC_DATA_SOURCE: '' }, dev).dataSource).toBe('mock');
  });

  it('rejects mock data in the production variant', () => {
    expect(() =>
      parseEnv({ EXPO_PUBLIC_DATA_SOURCE: 'mock' }, { variant: 'production', isDev: false }),
    ).toThrow('not allowed in the production variant');
    // Even a development bundle of the production variant cannot use mocks.
    expect(() =>
      parseEnv({ EXPO_PUBLIC_DATA_SOURCE: 'mock' }, { variant: 'production', isDev: true }),
    ).toThrow('not allowed in the production variant');
  });

  it('rejects mock data in release bundles (mocks are not bundled)', () => {
    expect(() =>
      parseEnv({ EXPO_PUBLIC_DATA_SOURCE: 'mock' }, { variant: 'preview', isDev: false }),
    ).toThrow('only works in development builds');
  });

  it('rejects unknown sources and normalises the API URL', () => {
    expect(() => parseEnv({ EXPO_PUBLIC_DATA_SOURCE: 'fake' }, dev)).toThrow(
      'Invalid environment variables',
    );
    expect(parseEnv({ EXPO_PUBLIC_API_URL: 'http://10.0.2.2:3000/' }, dev).apiUrl).toBe(
      'http://10.0.2.2:3000',
    );
  });
});
