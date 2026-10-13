import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { toast } from '@/components/feedback';
import { pickPdf } from '@/lib/media';
import { shareText } from '@/lib/share';

import { ChatComposer, ConversationActions, shareSummary } from '../components';
import { CONVERSATION, CONVERSATION_GROUPS } from '../data';
import { useChatStore } from '../store';

jest.mock('@/lib/media', () => ({
  pickPdf: jest.fn(),
  pickChatImage: jest.fn(),
}));
jest.mock('@/lib/share', () => ({
  shareText: jest.fn(async () => true),
  sharePdf: jest.fn(async () => true),
}));

beforeEach(() => {
  jest.clearAllMocks();
  act(() =>
    useChatStore.setState({
      messages: CONVERSATION.messages,
      currentId: CONVERSATION.id,
      title: CONVERSATION.title,
      groups: CONVERSATION_GROUPS,
    }),
  );
});

describe('Mais opções da conversa', () => {
  it('renames and pins the conversation', () => {
    render(<ConversationActions />);
    fireEvent.press(screen.getByRole('button', { name: 'Mais opções da conversa' }));
    fireEvent.press(screen.getByRole('button', { name: /^Renomear conversa/ }));
    fireEvent.changeText(screen.getByLabelText('Nome da conversa'), 'Setembro apertado');
    fireEvent.press(screen.getByRole('button', { name: 'Salvar nome' }));
    expect(useChatStore.getState().title).toBe('Setembro apertado');
    fireEvent.press(screen.getByRole('button', { name: /^Fixar no topo/ }));
    const pinned = useChatStore
      .getState()
      .groups.flatMap((group) => group.items)
      .find((item) => item.id === CONVERSATION.id);
    expect(pinned).toMatchObject({ title: 'Setembro apertado', pinned: true });
  });

  it('shares a summary without money values', () => {
    render(<ConversationActions />);
    fireEvent.press(screen.getByRole('button', { name: /^Compartilhar/ }));
    expect(shareText).toHaveBeenCalled();
    const text = jest.mocked(shareText).mock.calls[0]![0];
    expect(text).toContain('R$ •••');
    expect(text).not.toMatch(/R\$\s?\d/);
    expect(shareSummary('T', [{ id: 'u', role: 'user', text: 'Gastei R$ 742,18?' }])).toContain(
      'Você: Gastei R$ •••?',
    );
  });

  it('deletes the conversation', () => {
    const onDeleted = jest.fn();
    render(<ConversationActions onDeleted={onDeleted} />);
    fireEvent.press(screen.getByRole('button', { name: /^Apagar conversa/ }));
    expect(screen.getByText(/e as respostas do Tamanduá somem do histórico/)).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Apagar' }));
    const state = useChatStore.getState();
    expect(state.groups.flatMap((group) => group.items).map((item) => item.id)).not.toContain(
      CONVERSATION.id,
    );
    expect(state).toMatchObject({ messages: [], currentId: null, title: 'Nova conversa' });
    expect(onDeleted).toHaveBeenCalled();
  });
});

describe('Compositor', () => {
  it('attaches a PDF and sends it with the question', async () => {
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
    expect(screen.getByText('PDF · 184 KB · pronto para enviar')).toBeOnTheScreen();
    fireEvent.changeText(screen.getByLabelText('Mensagem'), 'o que tem neste extrato?');
    fireEvent.press(screen.getByRole('button', { name: 'Enviar mensagem' }));
    // The file goes first ("Enviando… 40%"), then the question.
    expect(await screen.findByText(/^Enviando… \d+%$/)).toBeOnTheScreen();
    await waitFor(() =>
      expect(onSend).toHaveBeenCalledWith('o que tem neste extrato?', {
        uri: 'file:///extrato.pdf',
        name: 'extrato-itau-setembro.pdf',
        kind: 'pdf',
        sizeBytes: 188_416,
      }),
    );
  });

  it('refuses files over 10 MB', async () => {
    const error = jest.spyOn(toast, 'error');
    jest.mocked(pickPdf).mockResolvedValue({
      uri: 'file:///grande.pdf',
      name: 'grande.pdf',
      mimeType: 'application/pdf',
      size: 11 * 1024 * 1024,
    });
    render(<ChatComposer onSend={jest.fn()} onPickAssistant={jest.fn()} />);
    fireEvent.press(screen.getByRole('button', { name: 'Anexar arquivo' }));
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Arquivo PDF' }));
    });
    expect(error).toHaveBeenCalledWith('O arquivo passa de 10 MB. Mande um menor.');
  });

  it('records, then reports when the transcription fails', async () => {
    const error = jest.spyOn(toast, 'error');
    const fetchMock = jest.spyOn(global, 'fetch').mockRejectedValue(new Error('offline'));
    render(<ChatComposer onSend={jest.fn()} onPickAssistant={jest.fn()} />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Falar' }));
    });
    expect(
      screen.getByText('Gravando… fale sua pergunta. Toque no quadrado para parar.'),
    ).toBeOnTheScreen();
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Parar e transcrever' }));
    });
    await waitFor(() =>
      expect(error).toHaveBeenCalledWith(expect.stringMatching(/^Não deu para transcrever\./)),
    );
    expect(screen.getByLabelText('Mensagem')).toBeOnTheScreen();
    fetchMock.mockRestore();
  });
});
