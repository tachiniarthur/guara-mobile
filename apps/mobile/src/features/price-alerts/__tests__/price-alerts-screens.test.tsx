import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { cents } from '@guara/utils';

import { toast } from '@/components/feedback';

import { NewPriceAlertScreen, PriceAlertDetailScreen, PriceAlertsScreen } from '../screens';
import { usePriceAlertsStore } from '../store';

const mockNavigate = jest.fn();
const mockBack = jest.fn();
let mockParams: Record<string, string> = {};

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({
    navigate: mockNavigate,
    replace: jest.fn(),
    back: mockBack,
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => mockParams,
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {};
  act(() => usePriceAlertsStore.getState().reset());
});

const text = (pattern: RegExp) => screen.getByText(pattern);

describe('Alerta de preço', () => {
  it('shows target, quote, distance and the last 30 days', () => {
    mockParams = { alertId: 'alert-btc' };
    render(<PriceAlertDetailScreen />);
    expect(text(/^Bitcoin · venda$/)).toBeOnTheScreen();
    expect(text(/^BTC · cotação via Brapi$/)).toBeOnTheScreen();
    expect(text(/^faltam 5,7%$/)).toBeOnTheScreen();
    expect(text(/^R\$.34\.800$/)).toBeOnTheScreen();
    expect(screen.getByLabelText(/linha do alvo em R\$.650\.000$/)).toBeOnTheScreen();
    expect(text(/^R\$.553\.600$/)).toBeOnTheScreen();
    expect(text(/^Ativo · confere a cada cotação$/)).toBeOnTheScreen();
    expect(text(/^Estou de olho: confiro o Bitcoin a cada cotação/)).toBeOnTheScreen();
  });

  it('pauses, resumes and cancels', () => {
    const success = jest.spyOn(toast, 'success');
    mockParams = { alertId: 'alert-btc' };
    render(<PriceAlertDetailScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Pausar' }));
    expect(text(/^Pausado por você$/)).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Retomar' }));
    expect(success).toHaveBeenLastCalledWith('Alerta retomado');

    fireEvent.press(screen.getByRole('button', { name: 'Cancelar alerta' }));
    expect(text(/^O Guará para de acompanhar o Bitcoin para este alvo\./)).toBeOnTheScreen();
    fireEvent.press(screen.getAllByRole('button', { name: 'Cancelar alerta' }).at(-1)!);
    expect(mockBack).toHaveBeenCalled();
    expect(usePriceAlertsStore.getState().alerts.map((alert) => alert.id)).toEqual([
      'alert-petr4',
      'alert-ivvb11',
    ]);
  });

  it('shows the trigger and offers to renew with another target', () => {
    act(() =>
      usePriceAlertsStore.getState().update('alert-btc', {
        status: 'triggered',
        triggeredAt: '2026-09-23T18:12:00.000Z',
        triggeredPrice: cents(65_130_000),
      }),
    );
    mockParams = { alertId: 'alert-btc' };
    render(<PriceAlertDetailScreen />);
    expect(text(/^Au! O Bitcoin passou de R\$.650\.000 às 15:12\./)).toBeOnTheScreen();
    expect(text(/^Pausado depois do aviso$/)).toBeOnTheScreen();
    expect(text(/^R\$.651\.300 · avisado no celular e no e-mail$/)).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Pausar' })).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: 'Renovar com outro alvo' }));
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/new-price-alert',
      params: { alertId: 'alert-btc' },
    });
  });
});

describe('Editar alerta', () => {
  it('saves a new target', () => {
    mockParams = { alertId: 'alert-petr4' };
    render(<NewPriceAlertScreen />);
    expect(screen.getByRole('header', { name: 'Editar alerta' })).toBeOnTheScreen();
    expect(text(/^Ainda não temos o histórico de 30 dias de PETR4\.$/)).toBeOnTheScreen();
    fireEvent.changeText(screen.getByLabelText('Valor-gatilho'), '3200');
    fireEvent.press(screen.getAllByRole('button', { name: 'Salvar alterações' })[0]!);
    const petr4 = usePriceAlertsStore.getState().alerts.find((alert) => alert.id === 'alert-petr4');
    expect(petr4?.targetPrice).toBe(3_200);
    expect(mockBack).toHaveBeenCalled();
  });

  it('renews a triggered alert as active', () => {
    act(() =>
      usePriceAlertsStore.getState().update('alert-btc', {
        status: 'triggered',
        triggeredAt: '2026-09-23T18:12:00.000Z',
        triggeredPrice: cents(65_130_000),
      }),
    );
    mockParams = { alertId: 'alert-btc' };
    render(<NewPriceAlertScreen />);
    fireEvent.press(screen.getByRole('button', { name: '+10%' }));
    fireEvent.press(screen.getAllByRole('button', { name: 'Renovar alerta' })[0]!);
    const btc = usePriceAlertsStore.getState().alerts.find((alert) => alert.id === 'alert-btc');
    expect(btc?.status).toBe('active');
    expect(btc?.targetPrice).toBe(67_672_000);
    expect(btc?.triggeredAt).toBeNull();
  });
});

describe('Alertas de preço', () => {
  it('lists the alerts and explains them when there is none', () => {
    const { unmount } = render(<PriceAlertsScreen />);
    fireEvent.press(screen.getByRole('link', { name: /^PETR4, compra\./ }));
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/price-alerts/[alertId]',
      params: { alertId: 'alert-petr4' },
    });
    unmount();

    act(() => {
      for (const alert of usePriceAlertsStore.getState().alerts) {
        usePriceAlertsStore.getState().cancel(alert.id);
      }
    });
    render(<PriceAlertsScreen />);
    expect(screen.getByText('Nenhum alerta de preço')).toBeOnTheScreen();
    expect(text(/^É só dizer o ativo e o preço que eu fico de guarda\./)).toBeOnTheScreen();
    expect(text(/^Depois de avisar, o alerta pausa até você decidir$/)).toBeOnTheScreen();
  });
});
