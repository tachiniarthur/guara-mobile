import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { toast } from '@/components/feedback';

import { SAVED_PROFILE } from '../data';
import { answersSummary, estimateProfile, profileDescription, profileScore } from '../lib/profile';
import { RedoProfileScreen } from '../screens';
import { useInvestorProfileStore } from '../store';

const mockBack = jest.fn();
const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({
    back: mockBack,
    replace: jest.fn(),
    navigate: mockNavigate,
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
});

describe('profile bands', () => {
  const all = (option: 'a' | 'b' | 'c' | 'd') => ({
    objective: option,
    horizon: option,
    loss_tolerance: option,
    experience: option,
    income_share: option,
    liquidity_needs: option,
  });

  it('scores growth above monthly income in the objective', () => {
    expect(profileScore({ objective: 'c' })).toBe(4);
    expect(profileScore({ objective: 'd' })).toBe(3);
    expect(profileScore(all('a'))).toBe(6);
    expect(profileScore(all('d'))).toBe(23);
  });

  it('splits the total into four profiles', () => {
    expect(estimateProfile(all('a'))).toBe('conservative');
    expect(estimateProfile(SAVED_PROFILE.answers)).toBe('moderate');
    expect(profileScore(SAVED_PROFILE.answers)).toBe(17);
    expect(estimateProfile(all('c'))).toBe('aggressive');
    expect(estimateProfile(all('d'))).toBe('sophisticated');
  });

  it('keeps Sofisticado for experienced investors', () => {
    // 22 points, but experience below "vários tipos": stops at Arrojado.
    expect(profileScore({ ...all('d'), experience: 'c' })).toBe(22);
    expect(estimateProfile({ ...all('d'), experience: 'c' })).toBe('aggressive');
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

    // Boldest answers on the way (including experience with several kinds): Sofisticado.
    for (let step = 0; step < 6; step += 1) {
      const options = screen.getAllByRole('radio');
      fireEvent.press(options.at(-1)!);
      fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
    }
    expect(screen.getByRole('header', { name: 'Seu perfil é Sofisticado' })).toBeOnTheScreen();
    expect(
      screen.getByLabelText('Renda variável internacional: alvo 25%, atual 7,9%, −17,1 p.p.'),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('Objetivo: Renda extra todo mês')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Salvar perfil' }));
    expect(success).toHaveBeenCalledWith('Seu perfil agora é Sofisticado');
    expect(useInvestorProfileStore.getState().profile.type).toBe('sophisticated');
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
    expect(screen.getByLabelText('Cripto: alvo 5%, atual 9,9%, +4,9 p.p.')).toBeOnTheScreen();
    expect(
      screen.getByLabelText('Renda fixa Brasil: alvo 48%, atual 46%, −2 p.p.'),
    ).toBeOnTheScreen();
    expect(
      screen.getByText(/fora do alvo em 3 de 5 grupos: Renda variável Brasil 17,2 p\.p\. acima/),
    ).toBeOnTheScreen();

    // The subclasses open on tap.
    fireEvent.press(screen.getByRole('button', { name: /^Renda variável Brasil:/ }));
    expect(
      screen.getByLabelText(
        'Ações large cap, PETR4 e BOVA11 · R$\u00a010.691,50: alvo 10%, atual 22,1%, +12,1 p.p.',
      ),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('link', { name: 'Comparar os 4 perfis' }));
    expect(mockNavigate).toHaveBeenCalledWith('/investments/allocation/profiles');
  });
});
