import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { useBankConnectionsStore } from '@/features/bank-connections';
import { useSubscriptionStore } from '@/stores';

import { AccountScreen, DeleteAccountScreen } from '../screens';

const mockNavigate = jest.fn();
const mockSetStatus = jest.fn();
let mockBreakpoint: 'phone' | 'tablet' = 'phone';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({
    navigate: mockNavigate,
    back: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
    canGoBack: () => true,
  }),
  usePathname: () => '/account',
}));

jest.mock('@/hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({ breakpoint: mockBreakpoint, isTablet: mockBreakpoint !== 'phone' }),
}));

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({ status: 'signedIn', setStatus: mockSetStatus }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockBreakpoint = 'phone';
  act(() => {
    useBankConnectionsStore.getState().reset();
    useSubscriptionStore.getState().reset();
  });
});

describe('Desconectar banco', () => {
  it('asks what to do with the history and frees a connection of the plan', () => {
    render(<AccountScreen />);
    fireEvent.press(screen.getAllByRole('button', { name: /Desconectar/ })[0]!);
    expect(screen.getByText('Desconectar o Nubank?')).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Manter o histórico já importado' })).toBeChecked();
    expect(
      screen.getByText('Libera 1 conexão do plano Completo: você fica com 1 de 3.'),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('radio', { name: 'Apagar o histórico do Nubank' }));
    const confirm = screen.getAllByRole('button', { name: 'Desconectar' });
    fireEvent.press(confirm[confirm.length - 1]!);
    expect(
      useBankConnectionsStore.getState().connections.some((bank) => bank.id === 'nubank'),
    ).toBe(false);
  });

  it('"Excluir conta" opens its own page', () => {
    render(<AccountScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Excluir conta' }));
    expect(mockNavigate).toHaveBeenCalledWith('/account/delete');
  });
});

describe('Excluir conta', () => {
  it('lists what is erased, from the user data', () => {
    render(<DeleteAccountScreen />);
    expect(screen.getByText('Autorizações do Nubank e do Itaú')).toBeOnTheScreen();
    expect(screen.getByText('Assinatura do plano Completo')).toBeOnTheScreen();
    expect(screen.getByText(/O arquivo chega no e-mail/)).toBeOnTheScreen();
  });

  it('only deletes after typing EXCLUIR and accepting', () => {
    render(<DeleteAccountScreen />);
    const remove = () => screen.getAllByRole('button', { name: 'Excluir conta' }).at(-1)!;
    expect(remove()).toBeDisabled();

    fireEvent.changeText(screen.getByLabelText('Digite EXCLUIR para confirmar'), 'excluir');
    expect(remove()).toBeDisabled();
    fireEvent.press(screen.getByRole('checkbox', { name: 'Entendi que não dá para desfazer' }));
    expect(remove()).toBeEnabled();

    fireEvent.press(remove());
    expect(mockSetStatus).toHaveBeenCalledWith('signedOut');
  });

  it('keeps the same features on tablets', () => {
    mockBreakpoint = 'tablet';
    render(<DeleteAccountScreen />);
    expect(screen.getByRole('header', { name: 'Excluir conta' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Baixar meus dados (LGPD)' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Conversar' })).toBeOnTheScreen();
  });
});
