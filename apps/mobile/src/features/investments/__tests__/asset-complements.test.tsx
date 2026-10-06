import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { AssetDetailScreen, AssetEventsScreen, AssetMoreDetailsScreen } from '../screens';
import { useInvestmentsStore } from '../store';

const mockNavigate = jest.fn();
let mockParams: Record<string, string> = {};
let mockBreakpoint: 'phone' | 'tablet' = 'phone';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({ navigate: mockNavigate, back: jest.fn(), canGoBack: () => true }),
  useLocalSearchParams: () => mockParams,
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({ breakpoint: mockBreakpoint, isTablet: mockBreakpoint !== 'phone' }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockBreakpoint = 'phone';
  act(() => useInvestmentsStore.getState().reset());
});

describe('Comparar com', () => {
  it('compares BOVA11 with the Ibovespa it replicates', () => {
    mockParams = { ticker: 'BOVA11' };
    render(<AssetDetailScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Comparar com: CDI' }));
    expect(screen.getByRole('radio', { name: /^IPCA/ })).toBeDisabled();
    fireEvent.press(screen.getByRole('radio', { name: /^Ibovespa/ }));
    fireEvent.press(screen.getByRole('button', { name: 'Aplicar' }));
    expect(screen.getByRole('button', { name: 'Comparar com: Ibovespa' })).toBeOnTheScreen();
    expect(screen.getByLabelText('BOVA11: +12,4%, 12 meses')).toBeOnTheScreen();
    expect(screen.getByLabelText('Ibovespa: +12,5%, 12 meses')).toBeOnTheScreen();
    expect(screen.getByLabelText('Diferença: −0,1 p.p., custo do fundo')).toBeOnTheScreen();
    expect(screen.getByText(/^O BOVA11 replica o Ibovespa/)).toBeOnTheScreen();
  });

  it('opens Mais detalhes', () => {
    mockParams = { ticker: 'BOVA11' };
    render(<AssetDetailScreen />);
    fireEvent.press(screen.getByRole('link', { name: 'Mais detalhes' }));
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/investments/asset/[ticker]/details',
      params: { ticker: 'BOVA11' },
    });
  });
});

describe('Preço ajustado', () => {
  it('shows the quote without the income', () => {
    mockParams = { ticker: 'HGLG11' };
    render(<AssetDetailScreen />);
    fireEvent.press(screen.getByRole('switch', { name: 'Preço ajustado' }));
    expect(screen.getByLabelText('Só a cota: +6,2%, 12 meses')).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Rendimentos pagos: R\$.13,20, por cota$/)).toBeOnTheScreen();
    expect(screen.getByLabelText('Com rendimentos: +15,0%, se ligar o ajuste')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Com e sem ajuste' })).toBeOnTheScreen();
    expect(screen.getByText(/^R\$.13,20 por cota$/)).toBeOnTheScreen();
  });
});

describe('Mais detalhes', () => {
  it('lists every field of the asset', () => {
    mockParams = { ticker: 'BOVA11' };
    render(<AssetMoreDetailsScreen />);
    expect(screen.getByRole('header', { name: 'Custos e impostos' })).toBeOnTheScreen();
    expect(screen.getByText('Não se aplica a ETF')).toBeOnTheScreen();
  });
});

describe('Eventos corporativos', () => {
  it('sums what the user received and groups by year', () => {
    mockParams = { ticker: 'HGLG11' };
    render(<AssetEventsScreen />);
    expect(screen.getByText(/^R\$.277,20$/)).toBeOnTheScreen();
    expect(screen.getByText('desde abril de 2026')).toBeOnTheScreen();
    expect(screen.getByText('por cota · yield de 8,2%')).toBeOnTheScreen();
    expect(screen.getByText(/^R\$.9,90 por cota · você recebeu R\$.277,20$/)).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Mostrar mais 9 de 2025' }));
    expect(screen.getByLabelText(/^15\/01\/2025, Rendimento/)).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Amortizações' }));
    expect(screen.getByRole('header', { name: 'Nenhum evento desse tipo' })).toBeOnTheScreen();
  });
});
