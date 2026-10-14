import { act, fireEvent, render, screen } from '@testing-library/react-native';

import {
  CutExpenseSimulationScreen,
  RetirementSimulationScreen,
  SavedSimulationsScreen,
} from '../screens';
import { useSimulationsStore } from '../store';

const mockNavigate = jest.fn();
const mockPush = jest.fn();
let mockParams: Record<string, string> = {};
let mockBreakpoint: 'phone' | 'tablet' = 'phone';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({
    navigate: mockNavigate,
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => mockParams,
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({ breakpoint: mockBreakpoint, isTablet: mockBreakpoint !== 'phone' }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {};
  mockBreakpoint = 'phone';
  act(() => useSimulationsStore.getState().reset());
});

const cards = () => screen.getAllByRole('link', { name: /Salva em/ });

describe('Simulações salvas', () => {
  it('lists the saved scenarios with recomputed summaries', () => {
    render(<SavedSimulationsScreen />);
    expect(cards()).toHaveLength(4);
    expect(screen.getByText('Salva em 23/09/2026 · virou meta')).toBeOnTheScreen();
    expect(screen.getByText(/mesma renda, 5 anos depois/)).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Objetivo' }));
    expect(cards()).toHaveLength(1);
  });

  it('opens a simulation with its premises', () => {
    render(<SavedSimulationsScreen />);
    fireEvent.press(screen.getByRole('link', { name: /^Corte de gasto: Cortar transporte/ }));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/investments/simulator/cut-expense',
      params: { saved: 'sim-cut-rides' },
    });
  });

  it('deletes and undoes', () => {
    render(<SavedSimulationsScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Excluir simulação Aposentadoria aos 60' }));
    expect(screen.getByText('“Aposentadoria aos 60” excluída')).toBeOnTheScreen();
    expect(cards()).toHaveLength(3);
    fireEvent.press(screen.getByRole('button', { name: 'Desfazer' }));
    expect(cards()).toHaveLength(4);
    expect(screen.queryByText('“Aposentadoria aos 60” excluída')).toBeNull();
  });

  it('shows the empty state', () => {
    act(() => {
      for (const item of useSimulationsStore.getState().saved) {
        useSimulationsStore.getState().remove(item.id);
      }
    });
    render(<SavedSimulationsScreen />);
    expect(screen.getByRole('header', { name: 'Nenhuma simulação salva' })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Abrir o simulador' }));
    expect(mockNavigate).toHaveBeenCalledWith('/investments/simulator');
  });

  it('keeps the same features on tablets', () => {
    mockBreakpoint = 'tablet';
    render(<SavedSimulationsScreen />);
    expect(screen.getByRole('header', { name: 'Simulações salvas' })).toBeOnTheScreen();
    expect(screen.getByText('4 simulações')).toBeOnTheScreen();
    expect(cards()).toHaveLength(4);
  });
});

describe('Simulador com simulações salvas', () => {
  it('saves the current premises', () => {
    render(<CutExpenseSimulationScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    const [latest] = useSimulationsStore.getState().saved;
    expect(latest).toMatchObject({
      name: 'Cortar transporte por app',
      input: { kind: 'cut', category: 'ride-hailing', percent: 80 },
    });
  });

  it('restores a saved retirement', () => {
    mockParams = { saved: 'sim-retire-60' };
    render(<RetirementSimulationScreen />);
    expect(
      screen.getByText('“Aposentadoria aos 60”, salva em 12/09/2026, com os números daquele dia.'),
    ).toBeOnTheScreen();
    expect(screen.getByText('Aposentadoria em 30 anos, em valores de hoje')).toBeOnTheScreen();
  });
});
