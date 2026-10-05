import { render, screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { PlaceholderScreen } from '@/components/layout';

describe('smoke', () => {
  it('renders a placeholder screen with its title', () => {
    render(<PlaceholderScreen title="Painel" />);
    expect(screen.getByRole('header', { name: 'Painel' })).toBeOnTheScreen();
  });

  it('shows the route param as subtitle', () => {
    render(<PlaceholderScreen title="Ativo" subtitle="PETR4" />);
    expect(screen.getByText('PETR4')).toBeOnTheScreen();
  });

  it('routes "/" to the dashboard of the authenticated area', async () => {
    renderRouter('./app', { initialUrl: '/' });
    expect(await screen.findByRole('header', { name: 'Boa tarde, Arthur.' })).toBeOnTheScreen();
  });

  it('opens a nested dynamic route', async () => {
    renderRouter('./app', { initialUrl: '/investments/asset/PETR4' });
    expect(await screen.findByRole('header', { name: 'Detalhes do ativo' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'PETR4' })).toBeOnTheScreen();
  });

  it('shows "Ativo não encontrado" for unknown tickers', async () => {
    renderRouter('./app', { initialUrl: '/investments/asset/XPTO3' });
    expect(await screen.findByRole('header', { name: 'Ativo não encontrado' })).toBeOnTheScreen();
  });
});
