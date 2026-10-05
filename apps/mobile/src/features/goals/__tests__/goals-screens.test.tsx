import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { toast } from '@/components/feedback';

import { GoalDetailScreen, GoalsScreen, NewGoalScreen } from '../screens';
import { useGoalsStore } from '../store';

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
let mockParams: Record<string, string> = {};
let mockBreakpoint: 'phone' | 'tablet' = 'phone';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({
    navigate: mockNavigate,
    replace: mockReplace,
    back: jest.fn(),
    canGoBack: () => false,
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
  act(() => useGoalsStore.getState().reset());
});

describe('Suas metas', () => {
  it('sums the goals and opens one', () => {
    render(<GoalsScreen />);
    expect(screen.getByRole('header', { name: 'Suas metas' })).toBeOnTheScreen();
    expect(screen.getByText('R$ 19.892')).toBeOnTheScreen();
    expect(
      screen.getByText(/sem a aposentadoria · sobrou R\$ 2\.287,53 em setembro/),
    ).toBeOnTheScreen();
    expect(screen.getByText(/^A reserva está no ritmo/)).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('link', { name: /^Reserva de emergência: No ritmo/ }));
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/goals/[goalId]',
      params: { goalId: 'reserva' },
    });
  });

  it('shows the empty state without goals', () => {
    act(() => {
      for (const goal of useGoalsStore.getState().goals) useGoalsStore.getState().remove(goal.id);
    });
    render(<GoalsScreen />);
    expect(screen.getByRole('header', { name: 'Nenhuma meta ainda' })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Criar primeira meta' }));
    expect(mockNavigate).toHaveBeenCalledWith('/new-goal');
  });

  it('keeps the same features on tablets', () => {
    mockBreakpoint = 'tablet';
    render(<GoalsScreen />);
    expect(screen.getByText('Acompanhadas pela Onça · 3 metas')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Nova meta' }));
    expect(mockNavigate).toHaveBeenCalledWith('/new-goal');
  });
});

describe('Meta', () => {
  it('shows progress, milestones and movements of the reserve', () => {
    mockParams = { goalId: 'reserva' };
    render(<GoalDetailScreen />);
    expect(screen.getByText('R$ 14.108')).toBeOnTheScreen();
    expect(screen.getByLabelText('25% · R$ 7.500, Chegou em nov/2025')).toBeOnTheScreen();
    expect(
      screen.getByLabelText('100% · R$ 30.000, Previsto para set/2027 · 6 meses de custo de vida'),
    ).toBeOnTheScreen();
    expect(screen.getByText(/^Junho caiu por um resgate/)).toBeOnTheScreen();
    expect(screen.getByLabelText('Depósito mensal: R$ 990 todo dia 5')).toBeOnTheScreen();
  });

  it('deposits, pauses and deletes', () => {
    const success = jest.spyOn(toast, 'success');
    mockParams = { goalId: 'reserva' };
    render(<GoalDetailScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Depositar agora' }));
    fireEvent.press(screen.getByRole('button', { name: 'Depositar' }));
    expect(success).toHaveBeenCalledWith(
      expect.stringMatching(/^R\$.990 depositados em Reserva de emergência$/),
    );
    expect(screen.getByText('R$ 16.882')).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Depósito extra/)).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Pausar' }));
    expect(screen.getByLabelText('Pausada')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Excluir meta' }));
    fireEvent.press(screen.getByRole('button', { name: 'Excluir' }));
    expect(useGoalsStore.getState().goals.map((goal) => goal.id)).not.toContain('reserva');
    expect(mockReplace).toHaveBeenCalledWith('/goals');
  });
});

describe('Nova meta', () => {
  it('turns the simulation into a goal', () => {
    const success = jest.spyOn(toast, 'success');
    mockParams = { from: 'simulation' };
    render(<NewGoalScreen />);
    expect(screen.getByLabelText('Da simulação · Juntar para um objetivo')).toBeOnTheScreen();
    expect(
      screen.getByText('Calculado para chegar no prazo. Equivale a 57% do que sobrou em setembro.'),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('Depósitos: 18 de R$ 1.310')).toBeOnTheScreen();
    expect(screen.getByLabelText('Primeiro depósito: 5 de outubro')).toBeOnTheScreen();
    expect(screen.getByLabelText('Chega em: abril de 2028')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Criar meta' }));
    expect(success).toHaveBeenCalledWith('Meta criada. A Onça acompanha a partir de 5 de outubro.');
    const created = useGoalsStore.getState().goals.at(-1);
    expect(created).toMatchObject({
      name: 'Viagem para o Japão',
      target: 3_000_000,
      saved: 400_000,
      monthlyDeposit: 131_000,
      deadline: '2028-04',
      pace: 'not_started',
    });
    expect(mockReplace).toHaveBeenCalledWith('/goals');
  });

  it('needs a name and an amount', () => {
    render(<NewGoalScreen />);
    expect(screen.getByRole('button', { name: 'Criar meta' })).toBeDisabled();
    expect(screen.getByText('Informe quanto custa para ver a prévia.')).toBeOnTheScreen();
  });
});
