import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { useUiPreferences } from '@/stores';

import { bellLabel, channelsLabel, notificationTime } from '../lib/labels';
import { NotificationsScreen } from '../screens';
import { useNotificationsStore } from '../store';

const mockNavigate = jest.fn();
let mockBreakpoint: 'phone' | 'tablet' = 'phone';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({ navigate: mockNavigate, back: jest.fn(), canGoBack: () => true }),
  usePathname: () => '/notifications',
}));

jest.mock('@/hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({ breakpoint: mockBreakpoint, isTablet: mockBreakpoint !== 'phone' }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockBreakpoint = 'phone';
  act(() => useNotificationsStore.getState().reset());
});

describe('Notificações', () => {
  it('lists the new and the earlier notices', () => {
    render(<NotificationsScreen />);
    expect(screen.getByRole('header', { name: 'NOVAS · 3' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'ANTERIORES' })).toBeOnTheScreen();
    expect(screen.getAllByLabelText('Não lida')).toHaveLength(3);
    expect(screen.getByText('Quero-quero · Fora do padrão · Hoje, 02:15')).toBeOnTheScreen();
    expect(screen.getByText('Tamanduá · Gastos · 21 set, 19:02')).toBeOnTheScreen();
  });

  it('opens the action of a notice and marks it as read', () => {
    render(<NotificationsScreen />);
    fireEvent.press(
      screen.getByRole('button', { name: 'Revisar: Compra de R$ 1.249,90 às 02:14' }),
    );
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/spending/[transactionId]',
      params: { transactionId: 'tx-eletronicos' },
    });
    expect(screen.getByRole('header', { name: 'NOVAS · 2' })).toBeOnTheScreen();
  });

  it('marks everything as read', () => {
    render(<NotificationsScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Marcar todas como lidas' }));
    expect(screen.queryByLabelText('Não lida')).toBeNull();
    expect(screen.queryByRole('header', { name: /NOVAS/ })).toBeNull();
  });

  it('filters by area and shows an empty state', () => {
    render(<NotificationsScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Conta' }));
    expect(screen.getByText('Itaú: a autorização termina em 26 de outubro')).toBeOnTheScreen();
    expect(screen.queryByText('Netflix subiu R$ 5,00')).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: 'Investimentos' }));
    expect(screen.getByRole('header', { name: 'Nada com esse filtro' })).toBeOnTheScreen();
    expect(
      screen.getByText(
        'Nenhuma notificação de Investimentos. Seus 3 alertas de preço ainda não dispararam.',
      ),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(screen.getByText('Netflix subiu R$ 5,00')).toBeOnTheScreen();
  });

  it('shows how each kind is delivered, from Meu perfil', () => {
    act(() =>
      useUiPreferences.setState({
        notices: {
          budgets: { push: true, email: true },
          priceAlerts: { push: true, email: false },
          unusualPurchases: { push: false, email: false },
        },
      }),
    );
    render(<NotificationsScreen />);
    expect(screen.getByText('Celular e e-mail')).toBeOnTheScreen();
    expect(screen.getByText('Celular')).toBeOnTheScreen();
    expect(screen.getByText('Desligado')).toBeOnTheScreen();
  });

  it('keeps the same features on tablets', () => {
    mockBreakpoint = 'tablet';
    render(<NotificationsScreen />);
    expect(screen.getByRole('header', { name: 'Notificações' })).toBeOnTheScreen();
    expect(screen.getByText('3 novas')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Marcar todas como lidas' }));
    expect(screen.getByText('Nenhuma nova')).toBeOnTheScreen();
  });
});

describe('labels', () => {
  it('formats times, channels and the bell', () => {
    expect(notificationTime('2026-09-23T05:15:00.000Z', '2026-09-23')).toBe('Hoje, 02:15');
    expect(notificationTime('2026-09-12T16:48:00.000Z', '2026-09-23')).toBe('12 set, 13:48');
    expect(channelsLabel({ push: false, email: true })).toBe('E-mail');
    expect(bellLabel(3)).toBe('Notificações, 3 novas');
    expect(bellLabel(1)).toBe('Notificações, 1 nova');
    expect(bellLabel(0)).toBe('Notificações');
  });
});
