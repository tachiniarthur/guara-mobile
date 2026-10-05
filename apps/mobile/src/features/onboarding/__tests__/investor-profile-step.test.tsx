import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { useInvestorProfileStore } from '@/features/investor-profile';

import { InvestorProfileStepScreen } from '../screens';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: jest.fn(), canGoBack: () => true }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  act(() => useInvestorProfileStore.getState().reset());
});

describe('Onboarding · Perfil de investidor', () => {
  it('asks the six questions, shows the result and goes to the assistants', () => {
    render(<InvestorProfileStepScreen />);
    expect(screen.getByText('Pergunta 1 de 6')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();

    const picks = [1, 2, 2, 2, 2, 2]; // the design's answers (b, c, c, c, c, c)
    for (const pick of picks) {
      fireEvent.press(screen.getAllByRole('radio')[pick]!);
      fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
    }
    expect(screen.getByText('Resultado · 6 de 6 respondidas')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Seu perfil é Moderado' })).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
    expect(useInvestorProfileStore.getState().profile.answers.objective).toBe('b');
    expect(mockPush).toHaveBeenCalledWith('/assistants');
  });

  it('can be answered later', () => {
    render(<InvestorProfileStepScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Responder depois' }));
    expect(mockPush).toHaveBeenCalledWith('/assistants');
  });
});
