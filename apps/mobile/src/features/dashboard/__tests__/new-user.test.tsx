import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { useBankConnectionsStore } from '@/features/bank-connections';
import { NewUserInvestments } from '@/features/investments';
import { SpendingScreen } from '@/features/spending';

import { DashboardScreen } from '../screens';

const mockNavigate = jest.fn();
let mockBreakpoint: 'phone' | 'tablet' = 'phone';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({ navigate: mockNavigate, back: jest.fn(), canGoBack: () => true }),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({ breakpoint: mockBreakpoint, isTablet: mockBreakpoint !== 'phone' }),
}));

const disconnectAll = () =>
  act(() => {
    for (const bank of useBankConnectionsStore.getState().connections) {
      useBankConnectionsStore.getState().disconnect(bank.id);
    }
  });

beforeEach(() => {
  jest.clearAllMocks();
  mockBreakpoint = 'phone';
  act(() => useBankConnectionsStore.getState().reset());
});

describe('usuário sem banco', () => {
  it('shows the first steps on Início', () => {
    disconnectAll();
    render(<DashboardScreen />);
    expect(screen.getByText('Saldo em 0 bancos')).toBeOnTheScreen();
    expect(screen.getByLabelText('Saldo sem informação')).toBeOnTheScreen();
    expect(screen.getByText('2 de 4 concluídos')).toBeOnTheScreen();
    expect(screen.queryByText('Resumo de setembro')).toBeNull();
    fireEvent.press(screen.getByRole('link', { name: /^Conectar seu primeiro banco/ }));
    expect(mockNavigate).toHaveBeenCalledWith('/connect-bank');
  });

  it('keeps the regular Início with a bank', () => {
    render(<DashboardScreen />);
    expect(screen.queryByText('Saldo em 0 bancos')).toBeNull();
  });

  it('explains Gastos before the first sync, on phones and tablets', () => {
    disconnectAll();
    render(<SpendingScreen />);
    expect(screen.getByRole('header', { name: 'Seus gastos aparecem aqui' })).toBeOnTheScreen();
    expect(
      screen.getByText('Valores aparecem depois da primeira sincronização.'),
    ).toBeOnTheScreen();
    mockBreakpoint = 'tablet';
    screen.rerender(<SpendingScreen />);
    expect(screen.getByRole('header', { name: 'Gastos' })).toBeOnTheScreen();
  });

  it('shows where the portfolio starts', () => {
    render(<NewUserInvestments />);
    expect(screen.getByRole('header', { name: 'Sua carteira começa aqui' })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Criar alerta de preço' }));
    expect(mockNavigate).toHaveBeenCalledWith('/new-price-alert');
  });
});
