import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { useSubscriptionStore } from '@/stores';

import { assistantWith } from '../assistants';
import { ChatComposer } from '../components';
import { useChatStore } from '../store';

const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({ navigate: mockNavigate, back: jest.fn(), canGoBack: () => true }),
}));

const NOTICE = 'Você usou as 300 perguntas deste mês do plano Completo.';

beforeEach(() => {
  jest.clearAllMocks();
  act(() => useSubscriptionStore.getState().reset());
});

describe('questions of the plan', () => {
  it('each question counts toward the month', () => {
    const before = useSubscriptionStore.getState().questionsUsed;
    act(() => useChatStore.getState().send('quanto gastei com mercado?'));
    expect(useSubscriptionStore.getState().questionsUsed).toBe(before + 1);
  });

  it('replaces the composer when the questions ran out', () => {
    act(() => useSubscriptionStore.setState({ questionsUsed: 300 }));
    const onSend = jest.fn();
    render(<ChatComposer onSend={onSend} onPickAssistant={jest.fn()} suggestions={['Resumo']} />);

    expect(screen.getByText(NOTICE)).toBeOnTheScreen();
    expect(
      screen.getByText(/Elas voltam no dia 10\. Até lá, seus dados continuam atualizando/),
    ).toBeOnTheScreen();
    expect(screen.queryByLabelText('Mensagem')).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'Ver planos' }));
    expect(mockNavigate).toHaveBeenCalledWith('/account/plan');

    // "Entendi" hides the notice; trying to ask again brings it back without sending.
    fireEvent.press(screen.getByRole('button', { name: 'Entendi' }));
    expect(screen.queryByText(NOTICE)).toBeNull();
    fireEvent.changeText(screen.getByLabelText('Mensagem'), 'e o aluguel?');
    fireEvent.press(screen.getByRole('button', { name: 'Enviar mensagem' }));
    expect(onSend).not.toHaveBeenCalled();
    expect(screen.getByText(NOTICE)).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Resumo' }));
    expect(onSend).not.toHaveBeenCalled();
  });

  it('sends normally below the limit', () => {
    const onSend = jest.fn();
    render(<ChatComposer onSend={onSend} onPickAssistant={jest.fn()} />);
    fireEvent.changeText(screen.getByLabelText('Mensagem'), 'e o aluguel?');
    fireEvent.press(screen.getByRole('button', { name: 'Enviar mensagem' }));
    expect(onSend).toHaveBeenCalledWith('e o aluguel?', undefined);
  });
});

describe('assistantWith', () => {
  it('uses the article of each animal', () => {
    expect(assistantWith('com', 'tamandua')).toBe('com o Tamanduá');
    expect(assistantWith('com', 'capivara')).toBe('com a Capivara');
    expect(assistantWith('a', 'pacu')).toBe('ao Pacu');
    expect(assistantWith('a', 'onca')).toBe('à Onça');
  });
});
