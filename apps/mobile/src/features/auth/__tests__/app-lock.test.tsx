import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { useUiPreferences } from '@/stores/ui-preferences';

import { AppLock } from '../components';
import { LOCK_AFTER_MS, useAppLockStore } from '../lock';

// The native module is mocked in __tests__/setup.ts.
const { authenticateAsync } = jest.requireMock<{ authenticateAsync: jest.Mock }>(
  'expo-local-authentication',
);

/** Under a busy test run, async steps take longer than the default second. */
const SLOW = { timeout: 3000 };

const mockSetStatus = jest.fn();
jest.mock('@/providers', () => ({
  ...jest.requireActual('@/providers'),
  useAuth: () => ({ status: 'signedIn', setStatus: mockSetStatus }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  act(() => {
    useAppLockStore.setState({ locked: false, backgroundAt: null });
    useUiPreferences.getState().set({ biometrics: true });
  });
});

afterAll(() => act(() => useUiPreferences.getState().set({ biometrics: false })));

describe('app lock', () => {
  it('locks after more than a minute in the background, only when it is on', () => {
    const store = useAppLockStore.getState();
    act(() => store.wentToBackground(0));
    act(() => store.cameBack(LOCK_AFTER_MS, true));
    expect(useAppLockStore.getState().locked).toBe(false);
    act(() => store.wentToBackground(0));
    act(() => store.cameBack(LOCK_AFTER_MS + 1, false));
    expect(useAppLockStore.getState().locked).toBe(false);
    act(() => store.wentToBackground(0));
    act(() => store.cameBack(LOCK_AFTER_MS + 1, true));
    expect(useAppLockStore.getState().locked).toBe(true);
  });

  it('locks on opening and unlocks with Face ID', async () => {
    render(<AppLock />);
    expect(await screen.findByText('Olá, Arthur')).toBeOnTheScreen();
    fireEvent.press(await screen.findByRole('button', { name: 'Desbloquear com Face ID' }));
    await waitFor(() => expect(screen.queryByText('Olá, Arthur')).toBeNull(), SLOW);
    expect(authenticateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ disableDeviceFallback: true }),
    );
  });

  it('uses the device passcode or signs out', async () => {
    authenticateAsync.mockResolvedValueOnce({ success: false, error: 'user_cancel' });
    render(<AppLock />);
    fireEvent.press(await screen.findByRole('button', { name: 'Usar a senha do aparelho' }));
    await waitFor(
      () =>
        expect(authenticateAsync).toHaveBeenCalledWith(
          expect.objectContaining({ disableDeviceFallback: false }),
        ),
      SLOW,
    );
    expect(screen.getByText('Olá, Arthur')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Sair da conta' }));
    expect(mockSetStatus).toHaveBeenCalledWith('signedOut');
    expect(useAppLockStore.getState().locked).toBe(false);
  });
});
