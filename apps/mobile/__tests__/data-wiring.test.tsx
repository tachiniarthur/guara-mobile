/** The placeholder routes wired to hooks show data from the fake layer for each scenario. */
import { screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { setMockScenario } from '@/mocks';

import { useFreshMocks } from './utils/query';

describe('data wiring', () => {
  useFreshMocks();

  it('complete scenario', async () => {
    renderRouter('./app', { initialUrl: '/budgets' });
    expect(await screen.findByText('4 tetos · 1 em alerta · 1 estourado')).toBeOnTheScreen();
  });

  it('spending loads the first page', async () => {
    renderRouter('./app', { initialUrl: '/spending' });
    expect(await screen.findByText('20 lançamentos carregados')).toBeOnTheScreen();
  });

  it('dashboard shows the consolidated balance', async () => {
    renderRouter('./app', { initialUrl: '/' });
    expect(await screen.findByText('Saldo consolidado')).toBeOnTheScreen();
    expect(await screen.findByText('4 avisos não lidos')).toBeOnTheScreen();
  });

  it('new_user scenario shows empty data and "—"', async () => {
    setMockScenario('new_user');
    renderRouter('./app', { initialUrl: '/budgets' });
    expect(await screen.findByText('0 tetos · 0 em alerta · 0 estourados')).toBeOnTheScreen();
  });

  // A 500 is retried twice (1 s + 2 s) before the error shows up.
  it('errors scenario shows the API message', async () => {
    setMockScenario('errors');
    renderRouter('./app', { initialUrl: '/' });
    expect(
      await screen.findByText(
        'Algo deu errado do nosso lado. Tente de novo em instantes.',
        {},
        { timeout: 8_000 },
      ),
    ).toBeOnTheScreen();
  }, 15_000);
});
