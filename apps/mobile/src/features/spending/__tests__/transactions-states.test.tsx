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

  it('on error, says which bank is late and retries', () => {
    mockStatus = 'error';
    mockStale = 'O Itaú não atualizou desde 10:05. Os lançamentos do Nubank estão em dia.';
    render(<TransactionsScreen />);
    expect(screen.getByText(mockStale)).toBeOnTheScreen();
    expect(
      screen.getByRole('header', { name: 'Não deu para carregar os lançamentos' }),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(mockRefetch).toHaveBeenCalled();
  });
});
