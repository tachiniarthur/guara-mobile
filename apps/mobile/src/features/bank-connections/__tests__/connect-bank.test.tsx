import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { toast } from '@/components/feedback';
import { InvestorProfileScreen } from '@/features/account';

import { CONNECTING_STEP_MS, CONNECTING_STEPS } from '../hooks/useMalvoFlow';
import { ConnectBankScreen, MalvoScreen } from '../screens';
import { useBankConnectionsStore } from '../store';

const mockBack = jest.fn();
const mockNavigate = jest.fn();
let mockParams: Record<string, string> = {};

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({
    back: mockBack,
    replace: jest.fn(),
    navigate: mockNavigate,
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => mockParams,
}));

/** Each connecting step schedules the next one after rendering. */
function finishImport() {
  for (let step = 0; step < CONNECTING_STEPS; step += 1) {
    act(() => jest.advanceTimersByTime(CONNECTING_STEP_MS));
  }
}

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {};
  act(() => useBankConnectionsStore.getState().reset());
});

describe('Conectar bancos (from Meu perfil)', () => {
  it('opens the Malvo for a new bank and keeps the connected ones', () => {
    const info = jest.spyOn(toast, 'info');
    render(<ConnectBankScreen />);
    expect(screen.getByRole('header', { name: 'Conecte seus bancos' })).toBeOnTheScreen();

    fireEvent.press(screen.getByText('Itaú'));
    expect(info).toHaveBeenCalledWith('Itaú já está conectado. Para desconectar, use Meu perfil.');

    fireEvent.press(screen.getByText('Inter'));
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/malvo/[bankId]',
      params: { bankId: 'inter' },
    });
  });

  it('respects the plan limit', () => {
    const info = jest.spyOn(toast, 'info');
    act(() => useBankConnectionsStore.getState().connect('inter', '2027-10-05'));
    render(<ConnectBankScreen />);
    fireEvent.press(screen.getByText('Caixa'));
    expect(info).toHaveBeenLastCalledWith('Seu plano permite 3 bancos.');
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe('Conectar banco pelo Malvo', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('shows the consent, imports step by step and connects the bank', () => {
    mockParams = { bankId: 'bradesco' };
    render(<MalvoScreen />);
    expect(screen.getByRole('header', { name: 'Conectar Bradesco' })).toBeOnTheScreen();
    expect(
      screen.getByLabelText('Contas: Saldos e extratos dos últimos 12 meses'),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('Vale por: 12 meses')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Continuar para o Bradesco' }));
    fireEvent.press(screen.getByRole('button', { name: 'Autorizar no Bradesco' }));
    expect(screen.getByRole('header', { name: 'Conectando o Bradesco…' })).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Autorização no Bradesco: Confirmada às/)).toBeOnTheScreen();
    expect(screen.getByLabelText('Buscando investimentos: Aguardando')).toBeOnTheScreen();

    finishImport();
    expect(screen.getByRole('header', { name: 'Bradesco conectado' })).toBeOnTheScreen();
    // The design only has the Itaú findings: other banks show "—".
    expect(screen.getByLabelText('Contas: —')).toBeOnTheScreen();
    expect(screen.getByText('3 de 3 conexões do plano Completo')).toBeOnTheScreen();
    expect(useBankConnectionsStore.getState().connections.map((item) => item.id)).toContain(
      'bradesco',
    );

    fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
    expect(mockBack).toHaveBeenCalled();
  });

  it('explains a canceled authorization and lets the user try again', () => {
    mockParams = { bankId: 'inter' };
    render(<MalvoScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Continuar para o Inter' }));
    fireEvent.press(screen.getByRole('button', { name: 'Cancelar no Inter' }));
    expect(screen.getByRole('header', { name: 'Não deu para conectar o Inter' })).toBeOnTheScreen();
    expect(screen.getByText(/^Código para o suporte: MLV-401/)).toBeOnTheScreen();
    expect(useBankConnectionsStore.getState().connections).toHaveLength(2);

    fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(screen.getByRole('header', { name: 'Conectar Inter' })).toBeOnTheScreen();
  });

  it('renews a consent that is about to end', () => {
    mockParams = { bankId: 'itau', mode: 'renew' };
    render(<MalvoScreen />);
    expect(screen.getByRole('header', { name: 'Renovar autorização do Itaú' })).toBeOnTheScreen();
    expect(screen.getByText('A atual termina em 26 de outubro')).toBeOnTheScreen();
    expect(screen.getByLabelText('Autorização atual: até 26/10/2026')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Renovar no Itaú' }));
    fireEvent.press(screen.getByRole('button', { name: 'Autorizar no Itaú' }));
    finishImport();
    expect(screen.getByRole('header', { name: 'Autorização do Itaú renovada' })).toBeOnTheScreen();
    const itau = useBankConnectionsStore.getState().connections.find((item) => item.id === 'itau');
    expect(itau?.status).toBe('ok');
  });

  it('lets the import finish in the background', () => {
    const info = jest.spyOn(toast, 'info');
    mockParams = { bankId: 'c6' };
    render(<MalvoScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Continuar para o C6 Bank' }));
    fireEvent.press(screen.getByRole('button', { name: 'Autorizar no C6 Bank' }));
    fireEvent.press(screen.getByRole('button', { name: 'Continuar usando o app' }));
    expect(info).toHaveBeenCalledWith('Avisamos quando o C6 Bank terminar de conectar.');
    expect(useBankConnectionsStore.getState().connections.map((item) => item.id)).toContain('c6');
  });
});

describe('Perfil de investidor (from Meu perfil)', () => {
  it('saves a new answer', () => {
    const success = jest.spyOn(toast, 'success');
    render(<InvestorProfileScreen />);
    fireEvent.press(screen.getByText('Venderia uma parte'));
    fireEvent.press(screen.getByRole('button', { name: 'Salvar perfil' }));
    expect(success).toHaveBeenCalledWith('Perfil de investidor atualizado');
    expect(mockBack).toHaveBeenCalled();
  });
});
