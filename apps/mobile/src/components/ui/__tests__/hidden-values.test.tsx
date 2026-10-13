import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { DashboardScreen } from '@/features/dashboard';
import { InvestmentsScreen } from '@/features/investments';
import { useUiPreferences } from '@/stores/ui-preferences';

import { maskMoneyIn } from '../MoneyText';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({
    navigate: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
    canGoBack: () => true,
  }),
  usePathname: () => '/',
}));

/** Any amount still showing digits. */
const AMOUNT = /R\$\s?\d/;

afterEach(() => act(() => useUiPreferences.getState().set({ hideBalances: false })));

describe('Ocultar valores', () => {
  it('hides the amounts inside sentences and keeps the rest', () => {
    expect(maskMoneyIn('Faltam R$ 63,60 até o limite')).toBe('Faltam R$ ••• até o limite');
    expect(maskMoneyIn('+R$ 862,40 em setembro (+1,8%)')).toBe('+R$ ••• em setembro (+1,8%)');
    expect(maskMoneyIn('Somam R$ 680 mil no patrimônio')).toBe('Somam R$ ••• no patrimônio');
  });

  it('hides every amount of Início and shows them again', () => {
    render(<DashboardScreen />);
    expect(screen.queryAllByText(AMOUNT).length).toBeGreaterThan(0);
    fireEvent.press(screen.getAllByRole('button', { name: 'Ocultar valores' })[0]!);
    expect(screen.queryAllByText(AMOUNT)).toHaveLength(0);
    expect(screen.getByText(/^Compra de R\$ ••• às 02:14$/)).toBeOnTheScreen();
    fireEvent.press(screen.getAllByRole('button', { name: 'Mostrar valores' })[0]!);
    expect(screen.queryAllByText(AMOUNT).length).toBeGreaterThan(0);
  });

  it('hides every amount of Investimentos', () => {
    act(() => useUiPreferences.getState().set({ hideBalances: true }));
    render(<InvestmentsScreen />);
    expect(screen.queryAllByText(AMOUNT)).toHaveLength(0);
    expect(screen.getByText(/^\+R\$ ••• em setembro \(\+1,8%\)$/)).toBeOnTheScreen();
  });
});
