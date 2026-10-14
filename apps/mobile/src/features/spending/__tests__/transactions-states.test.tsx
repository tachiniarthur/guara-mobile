import { fireEvent, render, screen } from '@testing-library/react-native';

import { TransactionsScreen } from '../screens';

const mockNavigate = jest.fn();
let mockStatus: 'empty' | 'error' = 'empty';
let mockStale: string | null = null;
const mockRefetch = jest.fn();

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({ navigate: mockNavigate, back: jest.fn(), canGoBack: () => true }),
  useLocalSearchParams: () => ({}),
}));

jest.mock('../hooks/useLedger', () => {
  const actual = jest.requireActual('../hooks/useLedger');
  return {
    ...actual,
    useLedger: () => ({
      ...actual.useLedger(),
      status: mockStatus,
      staleMessage: mockStale,
      refetch: mockRefetch,
    }),
  };
});

describe('Lançamentos: estados', () => {
  it('without a bank, invites to connect one', () => {
    mockStatus = 'empty';
    render(<TransactionsScreen />);
    expect(screen.getByRole('header', { name: 'Ainda sem lançamentos' })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Conectar banco' }));
    expect(mockNavigate).toHaveBeenCalledWith('/connect-bank');
  });

  it('on error, shows it under each day and retries', () => {
    mockStatus = 'error';
    mockStale = 'O Itaú não atualizou desde 10:05. Os lançamentos do Nubank estão em dia.';
    render(<TransactionsScreen />);
    expect(screen.getByText('Não deu para atualizar agora')).toBeOnTheScreen();
    expect(screen.getAllByText('Não deu para carregar').length).toBeGreaterThan(1);
    // The rows are not shown, only the day headers.
    expect(screen.queryByText('Loja de eletrônicos online')).toBeNull();
    fireEvent.press(screen.getAllByRole('button', { name: 'Tentar de novo' })[0]!);
    expect(mockRefetch).toHaveBeenCalled();
  });
});
