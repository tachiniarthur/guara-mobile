import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { NotificationsOffNotice } from '../NotificationsOffNotice';

// The native module is mocked in __tests__/setup.ts.
const { getPermissionsAsync } = jest.requireMock<{ getPermissionsAsync: jest.Mock }>(
  'expo-notifications',
);
const TITLE = 'As notificações do Guará estão desligadas neste celular';

beforeEach(() => {
  getPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: false, status: 'denied' });
});

afterAll(() => {
  getPermissionsAsync.mockResolvedValue({ granted: true, canAskAgain: true, status: 'granted' });
});

describe('notificações desligadas', () => {
  it('opens the settings and hides for now', async () => {
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
    render(<NotificationsOffNotice />);
    expect(await screen.findByText(TITLE)).toBeOnTheScreen();
    expect(screen.getByText(/Os e-mails continuam chegando\.$/)).toBeOnTheScreen();
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Abrir ajustes' }));
    });
    expect(openSettings).toHaveBeenCalled();
    fireEvent.press(screen.getByRole('button', { name: 'Agora não' }));
    expect(screen.queryByText(TITLE)).toBeNull();
  });

  it('lets the onboarding go on with e-mail only', async () => {
    const onEmailOnly = jest.fn();
    render(<NotificationsOffNotice variant="onboarding" onEmailOnly={onEmailOnly} />);
    expect(await screen.findByText(/^Sem a permissão,/)).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Seguir só com e-mail' }));
    expect(onEmailOnly).toHaveBeenCalled();
  });

  it('stays hidden while notifications are allowed', async () => {
    getPermissionsAsync.mockResolvedValue({ granted: true, canAskAgain: true, status: 'granted' });
    render(<NotificationsOffNotice />);
    await act(async () => {});
    expect(screen.queryByText(TITLE)).toBeNull();
  });
});
