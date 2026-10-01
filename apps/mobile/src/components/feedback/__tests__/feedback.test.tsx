import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useNetworkState } from 'expo-network';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AI_DISCLAIMER } from '@/constants/copy';

import { AiDisclaimer } from '../AiDisclaimer';
import { EmptyState } from '../EmptyState';
import { ErrorState } from '../ErrorState';
import { OfflineBanner } from '../OfflineBanner';
import { ToastViewport, toast } from '../Toast';

describe('ConfirmDialog', () => {
  const setup = (props: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    render(
      <ConfirmDialog
        open
        title="Revogar consentimento?"
        message="O banco deixará de ser sincronizado."
        confirmLabel="Revogar"
        destructive
        onConfirm={onConfirm}
        onCancel={onCancel}
        {...props}
      />,
    );
    return { onConfirm, onCancel };
  };

  it('confirms', () => {
    const { onConfirm, onCancel } = setup();
    expect(screen.getByRole('header', { name: 'Revogar consentimento?' })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Revogar' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('cancels', () => {
    const { onConfirm, onCancel } = setup();
    fireEvent.press(screen.getAllByRole('button', { name: 'Cancelar' }).at(-1)!);
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('blocks confirming twice while loading', () => {
    const { onConfirm } = setup({ loading: true });
    fireEvent.press(screen.getByRole('button', { name: 'Revogar' }));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('renders nothing when closed', () => {
    setup({ open: false });
    expect(screen.queryByText('Revogar consentimento?')).toBeNull();
  });
});

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};
const renderToasts = () =>
  render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <ToastViewport />
    </SafeAreaProvider>,
  );

describe('Toast', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('shows a message and dismisses it automatically', () => {
    renderToasts();
    act(() => {
      toast.success('Teto criado');
    });
    expect(screen.getByText('Teto criado')).toBeOnTheScreen();
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    expect(screen.queryByText('Teto criado')).toBeNull();
  });

  it('can be closed by the user', () => {
    renderToasts();
    act(() => {
      toast.error('Não foi possível salvar');
    });
    fireEvent.press(screen.getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByText('Não foi possível salvar')).toBeNull();
  });
});

describe('states', () => {
  it('ErrorState retries', () => {
    const onRetry = jest.fn();
    render(<ErrorState onRetry={onRetry} />);
    fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('EmptyState shows its action', () => {
    const onPress = jest.fn();
    render(<EmptyState title="Nenhum teto ainda" action={{ label: 'Criar teto', onPress }} />);
    fireEvent.press(screen.getByRole('button', { name: 'Criar teto' }));
    expect(onPress).toHaveBeenCalled();
  });

  it('AiDisclaimer shows the fixed copy', () => {
    render(<AiDisclaimer />);
    expect(screen.getByText(AI_DISCLAIMER)).toBeOnTheScreen();
  });

  it('OfflineBanner appears only when offline', () => {
    const { rerender } = render(<OfflineBanner />);
    expect(screen.queryByRole('alert')).toBeNull();

    jest
      .mocked(useNetworkState)
      .mockReturnValue({ isConnected: false, isInternetReachable: false });
    rerender(<OfflineBanner />);
    expect(screen.getByRole('alert')).toBeOnTheScreen();
  });
});
