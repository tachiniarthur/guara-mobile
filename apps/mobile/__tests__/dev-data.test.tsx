import { fireEvent, screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { getMockDb, useMockConfig } from '@/mocks';

import { useFreshMocks } from './utils/query';

describe('fake data panel (/dev/data)', () => {
  useFreshMocks();

  it('switches scenario, latency and error rate', async () => {
    renderRouter('./app', { initialUrl: '/dev/data' });
    expect(await screen.findByRole('header', { name: 'Dados falsos' })).toBeOnTheScreen();
    expect(screen.getByText(/3 bancos, 6 meses de lançamentos/)).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('tab', { name: 'Usuário novo' }));
    expect(useMockConfig.getState().scenario).toBe('new_user');
    expect(screen.getByText(/Sem bancos, lançamentos nem carteira/)).toBeOnTheScreen();
    expect(getMockDb().transactions).toHaveLength(0);

    fireEvent.press(screen.getByRole('tab', { name: '1,5 segundo' }));
    expect(useMockConfig.getState().latencyMs).toBe(1500);
    fireEvent.press(screen.getByRole('tab', { name: '10%' }));
    expect(useMockConfig.getState().errorRate).toBe(0.1);
  });

  it('resets the fake data', async () => {
    getMockDb().budgets = [];
    renderRouter('./app', { initialUrl: '/dev/data' });
    fireEvent.press(await screen.findByRole('button', { name: 'Reiniciar dados e limpar cache' }));
    expect(getMockDb().budgets).toHaveLength(4);
    expect(await screen.findByText('Dados falsos reiniciados e cache limpo')).toBeOnTheScreen();
  });

  describe('in production', () => {
    const runtime = globalThis as unknown as { __DEV__: boolean };
    const dev = runtime.__DEV__;
    beforeEach(() => {
      runtime.__DEV__ = false;
    });
    afterEach(() => {
      runtime.__DEV__ = dev;
    });

    it('is not reachable and falls back to the home screen', async () => {
      renderRouter('./app', { initialUrl: '/dev/data' });
      expect(await screen.findByRole('header', { name: 'Painel' })).toBeOnTheScreen();
      expect(screen.queryByRole('header', { name: 'Dados falsos' })).toBeNull();
    });
  });
});
