import { navigationSize } from '@guara/ui-tokens';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { ChatPanel } from '../components';
import { useChatStore } from '../store';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({ navigate: jest.fn(), back: jest.fn(), canGoBack: () => true }),
}));

const widthOf = (label: string) => {
  const node = screen.getByLabelText(label);
  const style = [node.props.style].flat() as { width?: number }[];
  return style.find((item) => item?.width !== undefined)?.width;
};

describe('chat side panel', () => {
  beforeEach(() => {
    act(() => useChatStore.setState({ panelOpen: true, panelView: 'history', context: null }));
  });

  it('has the same width with the history and with the conversation open', () => {
    render(<ChatPanel />);
    expect(widthOf('Conversas')).toBe(navigationSize.chatPanelWidth);

    fireEvent.press(screen.getByText('Gastos de setembro'));
    expect(screen.getByRole('header', { name: 'Gastos de setembro' })).toBeOnTheScreen();
    expect(widthOf('Conversa')).toBe(navigationSize.chatPanelWidth);

    fireEvent.press(screen.getByRole('button', { name: 'Ver conversas' }));
    expect(widthOf('Conversas')).toBe(navigationSize.chatPanelWidth);
  });

  it('shows a page context and gives way to the conversation once the user writes', () => {
    act(() =>
      useChatStore.getState().setContext({
        assistant: 'tamandua',
        subtitle: 'Lendo este relatório com você',
        intro: ['Sobraram ', { strong: 'R$ 2.287,53' }, '.'],
        question: 'Quer que eu separe o fixo do variável?',
        suggestions: ['Compare com agosto'],
        placeholder: 'Pergunte sobre este relatório',
      }),
    );
    render(<ChatPanel />);
    expect(screen.getByText('Lendo este relatório com você')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Compare com agosto'));
    expect(useChatStore.getState().context).toBeNull();
    expect(screen.getByText('Compare com agosto')).toBeOnTheScreen();
    expect(widthOf('Conversa')).toBe(navigationSize.chatPanelWidth);
  });

  it('closes and reopens', () => {
    render(<ChatPanel />);
    fireEvent.press(screen.getByRole('button', { name: 'Fechar conversas' }));
    expect(useChatStore.getState().panelOpen).toBe(false);
    act(() => useChatStore.getState().openPanel('conversation'));
    expect(useChatStore.getState().panelView).toBe('conversation');
  });
});
