import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { DuplicateNotice } from '../components';
import { ResolveDuplicateScreen } from '../screens';
import { useInvestmentsStore } from '../store';

const mockNavigate = jest.fn();
const mockBack = jest.fn();
let mockParams: Record<string, string> = {};
let mockBreakpoint: 'phone' | 'tablet' = 'phone';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({
    navigate: mockNavigate,
    back: mockBack,
    replace: jest.fn(),
    push: jest.fn(),
    canGoBack: () => true,
  }),
  usePathname: () => '/resolve-duplicate/dup-selic',
  useLocalSearchParams: () => mockParams,
}));

jest.mock('@/hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({ breakpoint: mockBreakpoint, isTablet: mockBreakpoint !== 'phone' }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = { duplicateId: 'dup-selic' };
  mockBreakpoint = 'phone';
  act(() => useInvestmentsStore.getState().reset());
});

describe('Investimento duplicado', () => {
  it('compares the bank position with the manual entry', () => {
    render(<ResolveDuplicateScreen />);
    expect(screen.getByLabelText('Open Finance · Itaú')).toBeOnTheScreen();
    expect(screen.getByText('R$ 15.892,10')).toBeOnTheScreen();
    expect(screen.getByText('R$ 15.600,00')).toBeOnTheScreen();
    expect(screen.getByText('10/03/2026 · à mão')).toBeOnTheScreen();
    // "Somar os dois" shows the sum of both.
    expect(screen.getByRole('radio', { name: 'Somar os dois' }).props.accessibilityHint).toMatch(
      /^Vira uma posição só, com R\$\s31\.492,10\./,
    );
    expect(screen.getByRole('radio', { name: 'Excluir o cadastro manual' })).toBeChecked();
  });

  it('confirms the choice and leaves the notice of Investimentos', () => {
    render(<ResolveDuplicateScreen />);
    fireEvent.press(screen.getByRole('radio', { name: 'Manter separados' }));
    fireEvent.press(screen.getByRole('button', { name: 'Confirmar' }));
    expect(useInvestmentsStore.getState().resolvedDuplicates).toEqual({
      'dup-selic': 'keep_separate',
    });
    expect(mockBack).toHaveBeenCalled();

    render(<DuplicateNotice />);
    expect(screen.queryByLabelText('Possível duplicidade')).toBeNull();
  });

  it('"Depois" changes nothing', () => {
    render(<ResolveDuplicateScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Depois' }));
    expect(useInvestmentsStore.getState().resolvedDuplicates).toEqual({});
  });

  it('the notice opens the screen with the chosen option', () => {
    render(<DuplicateNotice />);
    fireEvent.press(screen.getByRole('button', { name: 'Somar em uma posição' }));
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/resolve-duplicate/[duplicateId]',
      params: { duplicateId: 'dup-selic', choice: 'sum' },
    });

    mockParams = { duplicateId: 'dup-selic', choice: 'sum' };
    render(<ResolveDuplicateScreen />);
    expect(screen.getByRole('radio', { name: 'Somar os dois' })).toBeChecked();
  });

  it('keeps the same features on tablets', () => {
    mockBreakpoint = 'tablet';
    render(<ResolveDuplicateScreen />);
    expect(screen.getByRole('header', { name: 'Investimento duplicado' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Decidir depois' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Conversar' })).toBeOnTheScreen();
  });

  it('shows a state for an unknown duplicate', () => {
    mockParams = { duplicateId: 'xpto' };
    render(<ResolveDuplicateScreen />);
    expect(screen.getByRole('header', { name: 'Duplicidade não encontrada' })).toBeOnTheScreen();
  });
});
