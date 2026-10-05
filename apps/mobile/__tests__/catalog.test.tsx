import { screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

describe('UI catalog (/ui)', () => {
  it('renders every section without errors in development', async () => {
    renderRouter('./app', { initialUrl: '/ui' });
    expect(await screen.findByRole('header', { name: 'Catálogo de UI' })).toBeOnTheScreen();
    for (const section of [
      'Text',
      'Icon',
      'Valores',
      'Button, IconButton e LinkButton',
      'Campos',
      'Seleção',
      'Exibição',
      'Gráficos',
      'Feedback',
      'Layout',
    ]) {
      expect(screen.getByRole('header', { name: section })).toBeOnTheScreen();
    }
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
      renderRouter('./app', { initialUrl: '/ui' });
      expect(await screen.findByRole('header', { name: 'Boa tarde, Arthur.' })).toBeOnTheScreen();
      expect(screen.queryByRole('header', { name: 'Catálogo de UI' })).toBeNull();
    });
  });
});
