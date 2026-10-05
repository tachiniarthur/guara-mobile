import { fireEvent, render, screen } from '@testing-library/react-native';

import { ExposureCard } from '../components';
import { EXPOSURE, EXPOSURE_ASSETS } from '../data';

const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({ navigate: mockNavigate, back: jest.fn(), canGoBack: () => true }),
}));

describe('Onde seu dinheiro está no mundo', () => {
  it('describes the globe for screen readers', () => {
    render(<ExposureCard />);
    expect(screen.getByLabelText(/Globo com a exposição por país: Brasil 82%/)).toBeOnTheScreen();
  });

  it('lists the assets of the selected country and opens an asset page', () => {
    render(<ExposureCard />);
    fireEvent.press(screen.getByRole('radio', { name: /Brasil/ }));
    expect(screen.getByRole('header', { name: 'Ativos no Brasil' })).toBeOnTheScreen();
    expect(screen.getByText('PETR4')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('link', { name: /PETR4/ }));
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/investments/asset/[ticker]',
      params: { ticker: 'PETR4' },
    });
    fireEvent.press(screen.getByRole('button', { name: 'Fechar ativos' }));
    expect(screen.queryByRole('header', { name: 'Ativos no Brasil' })).toBeNull();
  });

  it('shows Bitcoin as the asset without a country', () => {
    render(<ExposureCard />);
    fireEvent.press(screen.getByRole('radio', { name: /Sem país/ }));
    expect(screen.getByRole('header', { name: 'Ativos sem país' })).toBeOnTheScreen();
    expect(screen.getByText('Bitcoin')).toBeOnTheScreen();
  });

  it('has assets for every place of the globe', () => {
    for (const item of EXPOSURE) expect(EXPOSURE_ASSETS[item.key].length).toBeGreaterThan(0);
  });
});
