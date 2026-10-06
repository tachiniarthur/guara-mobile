import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { toast } from '@/components/feedback';
import { useBankConnectionsStore } from '@/features/bank-connections';
import { pickSquarePhoto } from '@/lib/media';
import { useSubscriptionStore, useUserStore } from '@/stores';

import { PlanScreen, ProfileScreen } from '../screens';

const mockBack = jest.fn();
let mockBreakpoint: 'phone' | 'tablet' = 'phone';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({
    navigate: jest.fn(),
    replace: jest.fn(),
    back: mockBack,
    canGoBack: () => true,
  }),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({ breakpoint: mockBreakpoint, isTablet: mockBreakpoint !== 'phone' }),
}));

jest.mock('@/lib/media', () => ({ pickSquarePhoto: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  mockBreakpoint = 'phone';
  act(() => {
    useUserStore.getState().reset();
    useSubscriptionStore.getState().reset();
    useBankConnectionsStore.getState().reset();
  });
});

describe('Editar perfil', () => {
  it('saves the name and the initials color', () => {
    const success = jest.spyOn(toast, 'success');
    render(<ProfileScreen />);
    fireEvent.changeText(screen.getByLabelText('Nome'), 'Arthur Rodrigues');
    fireEvent.press(screen.getByRole('radio', { name: 'Cor verde' }));
    fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    expect(useUserStore.getState()).toMatchObject({
      name: 'Arthur Rodrigues',
      avatarColor: 'positive',
    });
    expect(success).toHaveBeenCalledWith('Perfil atualizado');
    expect(mockBack).toHaveBeenCalled();
  });

  it('asks to confirm a new e-mail and can cancel it', () => {
    render(<ProfileScreen />);
    fireEvent.changeText(screen.getByLabelText('E-mail'), 'arthur.r@exemplo');
    expect(screen.getByText(/^Confira o e-mail/)).toBeOnTheScreen();
    fireEvent.changeText(screen.getByLabelText('E-mail'), 'Arthur.R@exemplo.com');
    fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByRole('header', { name: 'Confirme seu novo e-mail' })).toBeOnTheScreen();
    expect(screen.getByText('arthur.r@exemplo.com · aguardando')).toBeOnTheScreen();
    expect(useUserStore.getState()).toMatchObject({
      email: 'arthur@exemplo.com',
      pendingEmail: 'arthur.r@exemplo.com',
    });
    expect(screen.getByRole('button', { name: 'Reenviar (60 s)' })).toBeDisabled();
    fireEvent.press(screen.getByRole('link', { name: 'Cancelar troca de e-mail' }));
    expect(useUserStore.getState().pendingEmail).toBeNull();
    expect(screen.getByLabelText('E-mail')).toHaveDisplayValue('arthur@exemplo.com');
  });

  it('uses a photo from the library', async () => {
    jest.mocked(pickSquarePhoto).mockResolvedValue('file:///foto.jpg');
    render(<ProfileScreen />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Escolher foto' }));
    });
    expect(screen.getByRole('link', { name: 'Remover foto' })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    expect(useUserStore.getState().photoUri).toBe('file:///foto.jpg');
  });
});

describe('Planos', () => {
  it('shows the usage and upgrades now', () => {
    const success = jest.spyOn(toast, 'success');
    render(<PlanScreen />);
    expect(screen.getByText('Assinatura mensal · renova em 10/10/2026')).toBeOnTheScreen();
    expect(screen.getByLabelText('2 de 3 bancos')).toBeOnTheScreen();
    expect(screen.getByText('112 de 300')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Mudar para o Ampliado, plano Ampliado' }));
    fireEvent.press(screen.getByRole('button', { name: 'Mudar de plano' }));
    expect(useSubscriptionStore.getState().planId).toBe('extended');
    expect(success).toHaveBeenCalledWith('Agora você está no plano Ampliado');
  });

  it('shows yearly prices and changes the billing', () => {
    render(<PlanScreen />);
    fireEvent.press(screen.getByRole('tab', { name: 'Anual · 2 meses grátis' }));
    expect(screen.getByText(/^equivale a R\$.16,58 por mês$/)).toBeOnTheScreen();
    fireEvent.press(
      screen.getByRole('button', { name: 'Mudar para cobrança anual, plano Completo' }),
    );
    expect(useSubscriptionStore.getState().billing).toBe('yearly');
  });

  it('schedules the Essencial keeping one bank', () => {
    render(<PlanScreen />);
    expect(
      screen.getByText(/^Para mudar, você escolhe qual banco fica conectado/),
    ).toBeOnTheScreen();
    fireEvent.press(
      screen.getByRole('button', { name: 'Mudar para o Essencial, plano Essencial' }),
    );
    fireEvent.press(screen.getByRole('radio', { name: /^Nubank/ }));
    expect(useSubscriptionStore.getState().scheduled).toEqual({
      planId: 'essential',
      keepBankId: 'nubank',
    });
    expect(useSubscriptionStore.getState().planId).toBe('complete');
    expect(screen.getByText(/^Seu plano Completo vale até 10\/10\/2026/)).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Manter o plano Completo' }));
    expect(useSubscriptionStore.getState().scheduled).toBeNull();
  });

  it('cancels the subscription at the end of the period', () => {
    render(<PlanScreen />);
    fireEvent.press(screen.getByRole('link', { name: 'Cancelar assinatura' }));
    fireEvent.press(screen.getByRole('button', { name: 'Cancelar assinatura' }));
    expect(useSubscriptionStore.getState().scheduled?.planId).toBe('essential');
  });

  it('compares the plans on tablets', () => {
    mockBreakpoint = 'tablet';
    render(<PlanScreen />);
    expect(screen.getByRole('header', { name: 'Comparar recursos' })).toBeOnTheScreen();
  });
});
