import { parseEnv } from '../env';

describe('parseEnv', () => {
  it('uses the local API by default', () => {
    expect(parseEnv({}).apiUrl).toBe('http://localhost:3000');
  });

  it('rejects invalid values and normalises the API URL', () => {
    expect(() => parseEnv({ EXPO_PUBLIC_API_URL: 'not a url' })).toThrow(
      'Invalid environment variables',
    );
    expect(parseEnv({ EXPO_PUBLIC_API_URL: 'http://10.0.2.2:3000/' }).apiUrl).toBe(
      'http://10.0.2.2:3000',
    );
  });
});
