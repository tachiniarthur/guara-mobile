import { fireEvent, render, screen } from '@testing-library/react-native';

import { PrivacyScreen, TermsScreen } from '../screens';

const mockBack = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({ back: mockBack, replace: mockReplace, canGoBack: () => true }),
}));

describe('Termos e privacidade', () => {
  it('shows the terms and links the privacy policy', () => {
    render(<TermsScreen />);
    expect(screen.getAllByRole('header', { name: 'Termos de uso' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('header', { name: '3. Conexão com bancos' })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('link', { name: 'Política de privacidade' }));
    expect(mockReplace).toHaveBeenCalledWith('/privacy');
    fireEvent.press(screen.getByRole('button', { name: 'Entendi' }));
    expect(mockBack).toHaveBeenCalled();
  });

  it('shows the privacy policy', () => {
    render(<PrivacyScreen />);
    expect(screen.getByRole('header', { name: 'Seus direitos (LGPD)' })).toBeOnTheScreen();
    expect(
      screen.getByText(/^Em resumo: usamos seus dados só para o app funcionar/),
    ).toBeOnTheScreen();
  });
});
