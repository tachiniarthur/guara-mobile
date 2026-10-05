import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { toast } from '@/components/feedback';

import { PropertiesCard } from '../components';
import { NewPropertyScreen, NewVehicleScreen, PropertyDetailScreen } from '../screens';
import { useInvestmentsStore } from '../store';

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
let mockParams: Record<string, string> = {};
let mockBreakpoint: 'phone' | 'tablet' = 'phone';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({
    navigate: mockNavigate,
    replace: mockReplace,
    back: mockBack,
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => mockParams,
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({ breakpoint: mockBreakpoint, isTablet: mockBreakpoint !== 'phone' }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {};
  mockBreakpoint = 'phone';
  act(() => useInvestmentsStore.getState().reset());
});

const text = (pattern: RegExp) => screen.getByText(pattern);

describe('Imóvel', () => {
  it('shows value, financing, history and the share of the net worth', () => {
    mockParams = { propertyId: 'apto' };
    render(<PropertyDetailScreen />);
    expect(text(/^Imóvel · 72 m² · São Paulo$/)).toBeOnTheScreen();
    expect(
      text(/^Atualizado em agosto de 2026 · próxima revisão em fevereiro de 2027$/),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('Já é seu: 65% do valor')).toBeOnTheScreen();
    expect(
      screen.getByLabelText(/^Agosto de 2026, Estimativa sua: R\$.620\.000, \+3,3%$/),
    ).toBeOnTheScreen();
    expect(text(/^83% do total$/)).toBeOnTheScreen();
  });

  it('updates the value and deletes', () => {
    const success = jest.spyOn(toast, 'success');
    mockParams = { propertyId: 'apto' };
    render(<PropertyDetailScreen />);
    fireEvent.press(screen.getAllByRole('button', { name: 'Atualizar valor' })[0]!);
    fireEvent.changeText(screen.getByLabelText('Valor estimado'), '65000000');
    fireEvent.press(screen.getByRole('button', { name: 'Salvar valor' }));
    expect(success).toHaveBeenCalledWith('Valor atualizado');
    const apartment = useInvestmentsStore.getState().properties[0]!;
    expect(apartment.kind === 'realEstate' && apartment.valuations[0]).toEqual({
      on: '2026-09',
      value: 65_000_000,
      kind: 'estimate',
    });

    fireEvent.press(screen.getByRole('link', { name: 'Excluir bem' }));
    fireEvent.press(screen.getByRole('button', { name: 'Excluir' }));
    expect(useInvestmentsStore.getState().properties.map((item) => item.id)).toEqual(['onix']);
    expect(mockBack).toHaveBeenCalled();
  });
});

describe('Veículo', () => {
  it('follows the FIPE table and can be marked as sold', () => {
    mockParams = { propertyId: 'onix' };
    render(<PropertyDetailScreen />);
    expect(text(/^Tabela FIPE de setembro\/2026$/)).toBeOnTheScreen();
    expect(text(/^−R\$.630 \(−0,8%\) em relação a agosto$/)).toBeOnTheScreen();
    expect(
      text(/^Carros perdem valor com o tempo\. Em 6 meses, a queda foi de R\$.2\.400 \(−3,0%\)\.$/),
    ).toBeOnTheScreen();
    expect(text(/^10,5% do total$/)).toBeOnTheScreen();
    fireEvent.press(screen.getAllByRole('button', { name: 'Marcar como vendido' })[0]!);
    fireEvent.press(screen.getAllByRole('button', { name: 'Marcar como vendido' }).at(-1)!);
    expect(useInvestmentsStore.getState().properties.map((item) => item.id)).toEqual(['apto']);
  });

  it('keeps the same features on tablets', () => {
    mockBreakpoint = 'tablet';
    mockParams = { propertyId: 'onix' };
    render(<PropertyDetailScreen />);
    expect(screen.getByRole('header', { name: 'Onix LT 2022' })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Mais opções do bem' }));
    expect(screen.getByRole('button', { name: 'Excluir bem' })).toBeOnTheScreen();
  });
});

describe('Cadastrar bens', () => {
  it('registers a real estate and previews the net worth', () => {
    render(<NewPropertyScreen />);
    expect(screen.getByRole('button', { name: 'Salvar imóvel' })).toBeDisabled();
    fireEvent.changeText(screen.getByLabelText('Nome'), 'Casa na praia');
    fireEvent.press(screen.getByRole('button', { name: 'Casa' }));
    fireEvent.changeText(screen.getByLabelText('Valor estimado'), '30000000');
    expect(text(/^\+R\$.300\.000$/)).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Salvar imóvel' }));
    const created = useInvestmentsStore.getState().properties.at(-1)!;
    expect(created).toMatchObject({ kind: 'realEstate', name: 'Casa na praia', type: 'house' });
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/investments/properties/[propertyId]',
      params: { propertyId: created.id },
    });
  });

  it('finds a vehicle in the FIPE table', () => {
    render(<NewVehicleScreen />);
    fireEvent.changeText(
      screen.getByLabelText('Buscar na Tabela FIPE: marca, modelo ou ano'),
      'onix 2022',
    );
    fireEvent.press(
      screen.getByRole('button', { name: 'Chevrolet Onix LT 1.0 Turbo, 2022 · Gasolina' }),
    );
    expect(screen.getByDisplayValue('Onix LT 2022')).toBeOnTheScreen();
    expect(text(/· atualizado todo mês, sozinho$/)).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Salvar veículo' }));
    expect(useInvestmentsStore.getState().properties.at(-1)).toMatchObject({
      kind: 'vehicle',
      name: 'Onix LT 2022',
      financing: null,
    });
  });
});

describe('Imóveis e outros bens', () => {
  it('lists the properties and opens one', () => {
    render(<PropertiesCard />);
    expect(text(/^Somam R\$.698\.500 no patrimônio$/)).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('link', { name: /^Onix LT 2022/ }));
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/investments/properties/[propertyId]',
      params: { propertyId: 'onix' },
    });
  });
});
