import { fireEvent, render, screen } from '@testing-library/react-native';

import { toast } from '@/components/feedback';
import { InvestorProfileScreen } from '@/features/account';

import { ConnectBankScreen } from '../screens';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({
    back: mockBack,
    replace: jest.fn(),
    navigate: jest.fn(),
    canGoBack: () => true,
  }),
}));

describe('Conectar bancos (from Meu perfil)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('keeps the connected banks and connects a new one up to the plan limit', () => {
    const success = jest.spyOn(toast, 'success');
    const info = jest.spyOn(toast, 'info');
    render(<ConnectBankScreen />);
    expect(screen.getByRole('header', { name: 'Conecte seus bancos' })).toBeOnTheScreen();

    fireEvent.press(screen.getByText('Itaú'));
    expect(info).toHaveBeenCalledWith('Itaú já está conectado. Para desconectar, use Meu perfil.');

    fireEvent.press(screen.getByText('Inter'));
    fireEvent.press(screen.getByText('Caixa'));
    expect(info).toHaveBeenLastCalledWith('Seu plano permite 3 bancos.');

    fireEvent.press(screen.getByRole('button', { name: 'Concluir' }));
    expect(success).toHaveBeenCalledWith('Inter conectado pelo Open Finance');
    expect(mockBack).toHaveBeenCalled();
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
