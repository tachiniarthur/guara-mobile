import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { getNetworkStateAsync } from 'expo-network';

import { pickPdf } from '@/lib/media';

import { REPLY_TIMING } from '../api/reply';
import { UPLOAD_TIMING } from '../api/upload';
import { ChatComposer } from '../components';
import { CONVERSATION } from '../data';
import { appendPart, conversationCaption, titleFrom } from '../lib/conversation';
import { ConversationScreen } from '../screens';
import { useChatStore } from '../store';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({
    navigate: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/chat/gastos-de-setembro',
}));

jest.mock('@/lib/media', () => ({
  pickPdf: jest.fn(),
  pickChatImage: jest.fn(),
}));

/** The stand-in answer takes a few dozen timers; under a busy test run they run late. */
const SLOW = { timeout: 5000 };

const OFFLINE = { isConnected: false, isInternetReachable: false };

beforeAll(() => {
  REPLY_TIMING.first = 1;
  REPLY_TIMING.word = 1;
  UPLOAD_TIMING.step = 1;
});

beforeEach(() => {
  act(() =>
    useChatStore.setState({
      messages: CONVERSATION.messages,
      currentId: CONVERSATION.id,
      title: CONVERSATION.title,
      startedLabel: CONVERSATION.updatedLabel,
      addressee: null,
      context: null,
    }),
  );
});

// Let the pending answer (or upload) finish inside act, then stop anything left.
afterEach(async () => {
  await waitFor(() => expect(useChatStore.getState().streaming).toBe(false), SLOW);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  act(() => useChatStore.getState().stop());
});

const lastMessage = () => useChatStore.getState().messages.at(-1)!;

describe('answers', () => {
  it('streams the answer and lets the Capivara hand the question over', async () => {
    act(() => useChatStore.getState().startNew());
    render(<ConversationScreen />);
    expect(screen.getByText('Ainda sem mensagens')).toBeOnTheScreen();
    expect(screen.getByText('5 assistentes prontos')).toBeOnTheScreen();
    fireEvent.press(
      screen.getByRole('button', { name: 'Tamanduá: Quanto gastei com comida em setembro?' }),
    );
    expect(await screen.findByText(/está escrevendo…$/)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Parar a resposta' })).toBeOnTheScreen();
    expect(screen.getByText(/^A Capivara chamou o/)).toBeOnTheScreen();
    await waitFor(() => expect(useChatStore.getState().streaming).toBe(false), SLOW);
    expect(
      screen.getByRole('header', { name: 'Quanto gastei com comida em setembro?' }),
    ).toBeOnTheScreen();
    expect(screen.getByText(/· com o Tamanduá$/)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Enviar mensagem' })).toBeOnTheScreen();
  });

  it('stops the answer being written', async () => {
    REPLY_TIMING.word = 50;
    act(() => useChatStore.getState().send('e assinaturas?'));
    await waitFor(() => expect(lastMessage().role).toBe('assistant'));
    act(() => useChatStore.getState().stop());
    const stopped = lastMessage();
    expect(stopped.role === 'assistant' && stopped.status).toBe('stopped');
    REPLY_TIMING.word = 1;
  });

  it('keeps the question when no assistant answers and asks again', async () => {
    render(<ConversationScreen />);
    act(() => useChatStore.getState().send('a PETR4 caiu hoje?'));
    expect(await screen.findByText('A Capivara não está respondendo agora')).toBeOnTheScreen();
    expect(screen.getByText(/· aguardando a Capivara$/)).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByText('A Capivara não está respondendo agora')).toBeOnTheScreen();
    expect(screen.getAllByText('A Capivara não está respondendo agora')).toHaveLength(1);
  });
});

describe('offline', () => {
  it('keeps a message not sent until it is tried again or deleted', async () => {
    jest.mocked(getNetworkStateAsync).mockResolvedValue(OFFLINE as never);
    render(<ConversationScreen />);
    act(() => useChatStore.getState().send('e com transporte?'));
    expect(await screen.findByText('Não enviada')).toBeOnTheScreen();
    expect(
      screen.getByText('Sem conexão. A mensagem fica aqui até você tentar de novo; nada se perde.'),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Apagar' }));
    expect(screen.queryByText('e com transporte?')).toBeNull();

    act(() => useChatStore.getState().send('e com transporte?'));
    await screen.findByText('Não enviada');
    jest.mocked(getNetworkStateAsync).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    } as never);
    fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    await waitFor(() => expect(screen.queryByText('Não enviada')).toBeNull());
  });

  it('keeps the file when the upload fails', async () => {
    jest.mocked(pickPdf).mockResolvedValue({
      uri: 'file:///extrato.pdf',
      name: 'extrato-itau-setembro.pdf',
      mimeType: 'application/pdf',
      size: 188_416,
    });
    const onSend = jest.fn();
    render(<ChatComposer onSend={onSend} onPickAssistant={jest.fn()} />);
    fireEvent.press(screen.getByRole('button', { name: 'Anexar arquivo' }));
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Arquivo PDF' }));
    });
    jest
      .mocked(getNetworkStateAsync)
      .mockResolvedValueOnce({ isConnected: true, isInternetReachable: true } as never)
      .mockResolvedValueOnce({ isConnected: true, isInternetReachable: true } as never)
      .mockResolvedValueOnce({ isConnected: true, isInternetReachable: true } as never)
      .mockResolvedValue(OFFLINE as never);
    fireEvent.press(screen.getByRole('button', { name: 'Enviar mensagem' }));
    expect(
      await screen.findByText('Não deu para enviar · a conexão caiu em 60%'),
    ).toBeOnTheScreen();
    expect(onSend).not.toHaveBeenCalled();

    jest.mocked(getNetworkStateAsync).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    } as never);
    fireEvent.press(screen.getByRole('button', { name: 'Tentar enviar de novo' }));
    await waitFor(() => expect(onSend).toHaveBeenCalled());
  });
});

describe('conversation helpers', () => {
  it('appends streamed text and names a conversation', () => {
    const blocks = appendPart(appendPart([{ type: 'text', content: [] }], 'Em '), 'setembro');
    expect(blocks).toEqual([{ type: 'text', content: ['Em setembro'] }]);
    expect(appendPart(blocks, { strong: 'R$ 862,40' })[0]).toEqual({
      type: 'text',
      content: ['Em setembro', { strong: 'R$ 862,40' }],
    });
    expect(titleFrom('quanto rendeu minha carteira em setembro?')).toBe(
      'Quanto rendeu minha carteira em…',
    );
    expect(conversationCaption([], 'Hoje, 14:40')).toBe('Ainda sem mensagens');
  });
});
