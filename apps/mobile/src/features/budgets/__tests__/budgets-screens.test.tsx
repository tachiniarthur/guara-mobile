import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { toast } from '@/components/feedback';

import { BudgetDetailScreen, BudgetsScreen, NewBudgetScreen } from '../screens';
import { useBudgetsStore } from '../store';

const mockNavigate = jest.fn();
const mockBack = jest.fn();
let mockParams: Record<string, string> = {};
let mockBreakpoint: 'phone' | 'tablet' = 'phone';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({
    navigate: mockNavigate,
    replace: jest.fn(),
    back: mockBack,
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
  act(() => useBudgetsStore.getState().reset());
});

const text = (pattern: RegExp) => screen.getByText(pattern);

describe('Tetos de gasto', () => {
  it('sums the caps and shows each one with its warnings', () => {
    render(<BudgetsScreen />);
    expect(text(/^Setembro · 3 tetos ativos$/)).toBeOnTheScreen();
    expect(text(/^R\$.1\.248,58$/)).toBeOnTheScreen();
    expect(text(/^67% do total dos tetos · recomeçam no dia 1º de outubro$/)).toBeOnTheScreen();
    expect(text(/^74% · No ritmo atual, fecha perto de R\$.960$/)).toBeOnTheScreen();
    expect(text(/^86% · Faltam R\$.63,60 · no ritmo atual, passa do teto$/)).toBeOnTheScreen();
    expect(screen.getAllByText('✓ R$ 500')).toHaveLength(1);
    expect(text(/^Alimentação: R\$.1\.020 de R\$.1\.000$/)).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('link', { name: /^Transporte:/ }));
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/budgets/[budgetId]',
      params: { budgetId: 'budget-transport' },
    });
  });

  it('explains the caps and suggests one when there is none', () => {
    act(() => {
      for (const budget of useBudgetsStore.getState().budgets) {
        useBudgetsStore.getState().remove(budget.id);
      }
    });
    render(<BudgetsScreen />);
    expect(screen.getByText('Nenhum teto ainda')).toBeOnTheScreen();
    expect(
      text(
        /^Alimentação teve média de R\$.910 nos últimos 3 meses\. Um teto de R\$.1\.000 deixaria folga e avisaria em julho, quando passou disso\.$/,
      ),
    ).toBeOnTheScreen();
    expect(text(/^Conta crédito e débito do Nubank e do Itaú$/)).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Criar teto de Alimentação' }));
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/new-budget',
      params: { categoryId: 'food' },
    });
  });
});

describe('Teto de Alimentação', () => {
  it('shows the month, the warnings sent and the transactions that counted', () => {
    mockParams = { budgetId: 'budget-food' };
    render(<BudgetDetailScreen />);
    expect(screen.getByRole('header', { name: 'Teto de Alimentação' })).toBeOnTheScreen();
    expect(text(/^Teto de R\$.1\.000 · julho passou do limite$/)).toBeOnTheScreen();
    expect(
      text(/^\*setembro até o dia 23\. Média dos últimos 3 meses: R\$.910\.$/),
    ).toBeOnTheScreen();
    expect(text(/^12\/09\/2026, 13:48 · celular$/)).toBeOnTheScreen();
    expect(screen.getAllByText('Enviado')).toHaveLength(2);
    expect(screen.getByText('Aguardando')).toBeOnTheScreen();
    expect(text(/^31 em setembro · Nubank e Itaú$/)).toBeOnTheScreen();
    expect(text(/^23 de setembro · 08:40 · Nubank crédito$/)).toBeOnTheScreen();
  });

  it('deletes the cap after confirming', () => {
    const success = jest.spyOn(toast, 'success');
    mockParams = { budgetId: 'budget-food' };
    render(<BudgetDetailScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Excluir' }));
    expect(
      text(
        /^Os avisos de R\$.500, R\$.700 e R\$.1\.000 param\. O histórico do teto some, mas seus lançamentos de Alimentação não mudam\.$/,
      ),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Excluir teto' }));
    expect(mockBack).toHaveBeenCalled();
    expect(success).toHaveBeenCalledWith('Teto de Alimentação excluído');
    expect(useBudgetsStore.getState().budgets.map((budget) => budget.id)).toEqual([
      'budget-transport',
      'budget-leisure',
    ]);
  });

  it('says when the cap no longer exists', () => {
    mockParams = { budgetId: 'budget-x' };
    render(<BudgetDetailScreen />);
    expect(screen.getByText('Teto não encontrado')).toBeOnTheScreen();
  });
});

describe('Editar e criar teto', () => {
  it('edits the cap with its warnings', () => {
    mockParams = { budgetId: 'budget-food' };
    render(<NewBudgetScreen />);
    expect(screen.getByRole('header', { name: 'Editar teto de Alimentação' })).toBeOnTheScreen();
    expect(
      text(/^Você recebe 3 avisos: em R\$.500, em R\$.700 e ao bater o teto de R\$.1\.000\./),
    ).toBeOnTheScreen();
    fireEvent.changeText(screen.getByLabelText('Teto mensal'), '120000');
    fireEvent.press(screen.getAllByRole('button', { name: 'Salvar alterações' })[0]!);
    const food = useBudgetsStore.getState().budgets.find((budget) => budget.id === 'budget-food');
    expect(food?.limit).toBe(120_000);
    expect(food?.warnings).toEqual([50_000, 70_000]);
    expect(mockBack).toHaveBeenCalled();
  });

  it('offers only categories without a cap', () => {
    render(<NewBudgetScreen />);
    expect(
      screen.getByRole('header', { name: 'Quanto você quer gastar, no máximo?' }),
    ).toBeOnTheScreen();
    expect(
      text(/^Ainda não temos histórico de Assinaturas para comparar com o teto\./),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getAllByRole('button', { name: 'Salvar teto' })[0]!);
    expect(useBudgetsStore.getState().budgets.at(-1)?.categoryId).toBe('subscriptions');
  });
});
