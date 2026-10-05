import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { toast } from '@/components/feedback';

import { SAVED_PROFILE } from '../data';
import {
  answersSummary,
  compareAllocation,
  differenceText,
  estimateProfile,
  profileDescription,
} from '../lib/profile';
import { RedoProfileScreen } from '../screens';
import { useInvestorProfileStore } from '../store';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({
    back: mockBack,
    replace: jest.fn(),
    navigate: jest.fn(),
    canGoBack: () => true,
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  act(() => useInvestorProfileStore.getState().reset());
});

describe('investor profile', () => {
  it('estimates the profile and describes it from the answers', () => {
    expect(estimateProfile(SAVED_PROFILE.answers)).toBe('moderate');
    expect(
      estimateProfile({
        objective: 'a',
        horizon: 'a',
        loss_tolerance: 'a',
        experience: 'a',
        income_share: 'b',
        liquidity_needs: 'a',
      }),
    ).toBe('conservative');
    expect(profileDescription('moderate', SAVED_PROFILE.answers)).toBe(
      'Você aceita alguma oscilação para ganhar mais que a renda fixa, mas quer a maior parte do dinheiro protegida. Seu prazo de 3 a 10 anos e a parte pequena que talvez precise resgatar combinam com uma carteira equilibrada.',
    );
    expect(answersSummary(SAVED_PROFILE.answers).map((item) => item.value)).toEqual([
      'Juntar para um objetivo',
      '3 a 10 anos',
      'Manteria e esperaria',
      'Renda fixa, fundos e um pouco de ações',
      '10% a 25%',
      'Uma parte pequena',
    ]);
  });

  it('compares the target allocation with the portfolio', () => {
    const result = compareAllocation(
      [
        { key: 'fixed', label: 'Renda fixa', color: '#000', current: 46 },
        { key: 'crypto', label: 'Cripto', color: '#000', current: 10 },
      ],
      { fixed: 50, crypto: 5 },
    );
    expect(result.scale).toBe(50);
    expect(result.biggest).toEqual({ label: 'Cripto', points: 5, direction: 'acima' });
    expect(result.close).toBe(true);
    expect([differenceText(-4), differenceText(-1), differenceText(5)]).toEqual([
      '−4 p.p.',
      'no alvo',
      '+5 p.p.',
    ]);
  });
});

describe('Refazer perfil', () => {
  it('goes through the six questions and saves the result', () => {
    const success = jest.spyOn(toast, 'success');
    render(<RedoProfileScreen />);
    expect(screen.getByLabelText('Seu perfil atual: Moderado')).toBeOnTheScreen();
    expect(screen.getByText('Mesmas 6 perguntas do início · leva 2 minutos')).toBeOnTheScreen();
    expect(
      screen.getByRole('header', { name: 'Qual é o seu principal objetivo ao investir?' }),
    ).toBeOnTheScreen();

    // Bolder answers on the way: Arrojado at the end.
    for (let step = 0; step < 6; step += 1) {
      const options = screen.getAllByRole('radio');
      fireEvent.press(options.at(-1)!);
      fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
    }
    expect(screen.getByRole('header', { name: 'Seu perfil é Arrojado' })).toBeOnTheScreen();
    expect(screen.getByText(/^A alocação-alvo do perfil Arrojado/)).toBeOnTheScreen();
    expect(screen.getByLabelText('Objetivo: Renda extra todo mês')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Salvar perfil' }));
    expect(success).toHaveBeenCalledWith('Seu perfil agora é Arrojado');
    expect(useInvestorProfileStore.getState().profile.type).toBe('aggressive');
    expect(mockBack).toHaveBeenCalled();
  });

  it('shows the target allocation of the Moderado profile against the portfolio', () => {
    render(<RedoProfileScreen />);
    for (let step = 0; step < 6; step += 1) {
      fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
    }
    expect(screen.getByRole('header', { name: 'Seu perfil é Moderado' })).toBeOnTheScreen();
    expect(
      screen.getByText(/Seu perfil continua o mesmo; ao salvar, a data é atualizada\./),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('Cripto: alvo 5%, sua carteira 10%, +5 p.p.')).toBeOnTheScreen();
    expect(screen.getByText(/Cripto, 5 p\.p\. acima/)).toBeOnTheScreen();
  });
});
