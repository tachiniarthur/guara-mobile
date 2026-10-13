import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { EmailAuthError, requestEmailCode, verifyEmailCode } from '@/lib/auth-email';

import { SignInScreen, VerifyCodeScreen, WelcomeScreen } from '../screens';
import { useEmailCodeStore } from '../store';

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockSetStatus = jest.fn();

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({
    navigate: mockNavigate,
    replace: mockReplace,
    back: jest.fn(),
    canGoBack: () => true,
  }),
}));

jest.mock('@/providers', () => ({
  ...jest.requireActual('@/providers'),
  useAuth: () => ({ status: 'signedOut', setStatus: mockSetStatus }),
}));

jest.mock('@/lib/auth-email', () => {
  const actual = jest.requireActual('@/lib/auth-email');
  return { ...actual, requestEmailCode: jest.fn(), verifyEmailCode: jest.fn() };
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(requestEmailCode).mockResolvedValue(undefined);
  jest.mocked(verifyEmailCode).mockResolvedValue(undefined);
  act(() => useEmailCodeStore.getState().reset());
});

describe('Boas-vindas', () => {
  it('sends a code to create the account', async () => {
    render(<WelcomeScreen />);
    fireEvent.changeText(screen.getByLabelText('E-mail'), 'Arthur@Exemplo.com ');
    fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/verify-code'));
    expect(requestEmailCode).toHaveBeenCalledWith('arthur@exemplo.com', { createUser: true });
    expect(useEmailCodeStore.getState().mode).toBe('sign-up');
  });
});

describe('Entrar', () => {
  it('offers to create an account when there is none', async () => {
    jest.mocked(requestEmailCode).mockRejectedValueOnce(new EmailAuthError('no-account'));
    render(<SignInScreen />);
    fireEvent.changeText(screen.getByLabelText('E-mail'), 'artur@exemplo.com');
    fireEvent.press(screen.getByRole('button', { name: 'Receber código' }));
    expect(
      await screen.findByText(
        'Não achamos uma conta com artur@exemplo.com. Confira se o e-mail está certo.',
      ),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Criar conta com este e-mail' }));
    await waitFor(() =>
      expect(requestEmailCode).toHaveBeenLastCalledWith('artur@exemplo.com', {
        createUser: true,
      }),
    );
    expect(mockNavigate).toHaveBeenCalledWith('/verify-code');
  });

  it('keeps the e-mail when there is no internet', async () => {
    jest.mocked(requestEmailCode).mockRejectedValueOnce(new EmailAuthError('network'));
    render(<SignInScreen />);
    fireEvent.changeText(screen.getByLabelText('E-mail'), 'arthur@exemplo.com');
    fireEvent.press(screen.getByRole('button', { name: 'Receber código' }));
    expect(await screen.findByText(/Conecte-se ao Wi-Fi ou aos dados móveis/)).toBeOnTheScreen();
    expect(screen.getByLabelText('E-mail').props.value).toBe('arthur@exemplo.com');
  });
});

describe('Código', () => {
  const typeCode = (code: string) =>
    fireEvent.changeText(screen.getByLabelText('Código de 6 dígitos'), code);

  it('signs in with the 6 digits', async () => {
    act(() => useEmailCodeStore.getState().codeSent('arthur@exemplo.com', 'sign-in'));
    render(<VerifyCodeScreen />);
    expect(screen.getByText('Digite o código')).toBeOnTheScreen();
    expect(screen.getByText(/^Reenviar código em/)).toBeOnTheScreen();
    typeCode('482917');
    await waitFor(() => expect(mockSetStatus).toHaveBeenCalledWith('signedIn'));
    expect(verifyEmailCode).toHaveBeenCalledWith('arthur@exemplo.com', '482917');
  });

  it('counts the wrong tries', async () => {
    jest.mocked(verifyEmailCode).mockRejectedValue(new EmailAuthError('invalid'));
    act(() => useEmailCodeStore.getState().codeSent('arthur@exemplo.com', 'sign-up'));
    render(<VerifyCodeScreen />);
    expect(screen.getByText('Confirme seu e-mail')).toBeOnTheScreen();
    typeCode('482917');
    expect(
      await screen.findByText(
        'Código incorreto. Confira os números e tente de novo. Restam 4 tentativas.',
      ),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeDisabled();
    expect(mockSetStatus).not.toHaveBeenCalled();
  });

  it('asks for a new code once it expired', async () => {
    act(() => {
      useEmailCodeStore.getState().codeSent('arthur@exemplo.com', 'sign-in');
      useEmailCodeStore.setState({ sentAt: Date.now() - 11 * 60 * 1000 });
    });
    render(<VerifyCodeScreen />);
    typeCode('482917');
    expect(await screen.findByText('Este código venceu.')).toBeOnTheScreen();
    expect(verifyEmailCode).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole('button', { name: 'Enviar novo código' }));
    await waitFor(() => expect(screen.queryByText('Este código venceu.')).toBeNull(), {
      timeout: 3000,
    });
    expect(requestEmailCode).toHaveBeenCalledWith('arthur@exemplo.com', { createUser: false });
  });

  it('goes back to the start without a code on its way', () => {
    render(<VerifyCodeScreen />);
    expect(mockReplace).toHaveBeenCalledWith('/welcome');
  });
});
