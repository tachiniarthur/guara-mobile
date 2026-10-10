import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { useChatStore } from '@/features/chat';

describe('chat em qualquer tela (phone)', () => {
  beforeEach(() => {
    act(() => useChatStore.setState({ origin: null, context: null }));
  });

  it('"Conversar" opens the chat over the page, goes full screen and comes back', async () => {
    const router = renderRouter('./app', { initialUrl: '/spending' });
    await screen.findByRole('tab', { name: 'Conversar' });

    fireEvent.press(screen.getByRole('tab', { name: 'Conversar' }));
    expect(await screen.findByRole('button', { name: 'Fechar o chat' })).toBeOnTheScreen();
    expect(router.getPathname()).toBe('/chat-panel');
    expect(useChatStore.getState().origin).toBe('/spending');
    expect(screen.getByText('Hoje, 14:32 · com o Tamanduá')).toBeOnTheScreen();
    expect(
      screen.getByText('A IA pode errar. Nada aqui é recomendação de investimento.'),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Abrir em tela cheia' }));
    expect(await screen.findByRole('button', { name: 'Sair da tela cheia' })).toBeOnTheScreen();
    expect(router.getPathname()).toBe('/chat/gastos-de-setembro');

    fireEvent.press(screen.getByRole('button', { name: 'Sair da tela cheia' }));
    expect(await screen.findByRole('button', { name: 'Fechar o chat' })).toBeOnTheScreen();
    expect(router.getPathname()).toBe('/chat-panel');

    fireEvent.press(screen.getAllByRole('button', { name: 'Fechar o chat' })[0]!);
    expect(await screen.findByRole('tab', { name: 'Gastos' })).toBeOnTheScreen();
    expect(router.getPathname()).toBe('/spending');
  });

  it('forms have the round chat button', async () => {
    const router = renderRouter('./app', { initialUrl: '/new-budget' });
    fireEvent.press(await screen.findByRole('button', { name: 'Abrir o chat' }));
    expect(await screen.findByRole('button', { name: 'Abrir em tela cheia' })).toBeOnTheScreen();
    expect(router.getPathname()).toBe('/chat-panel');
    expect(useChatStore.getState().origin).toBe('/new-budget');
  });

  it('"Histórico de conversas" leaves the panel for the history page', async () => {
    const router = renderRouter('./app', { initialUrl: '/' });
    fireEvent.press(await screen.findByRole('tab', { name: 'Conversar' }));
    fireEvent.press(await screen.findByRole('button', { name: 'Histórico de conversas' }));
    expect(await screen.findByRole('header', { name: 'Conversas' })).toBeOnTheScreen();
    expect(router.getPathname()).toBe('/chat');
  });
});
