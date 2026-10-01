/**
 * Opens EVERY route of the app and checks its placeholder title.
 * Generated from the route table used to scaffold app/; keep in sync when adding routes.
 */
import { screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { devSession } from '@/providers/AuthProvider';

type RouteCase = [url: string, title: string, param: string | null];

const AUTH_ROUTES: RouteCase[] = [
  ['/sign-in', 'Entrar', null],
  ['/sign-up', 'Criar conta', null],
  ['/forgot-password', 'Recuperar senha', null],
];

const ONBOARDING_ROUTES: RouteCase[] = [
  ['/connect-banks', 'Conecte seus bancos', null],
  ['/investor-profile', 'Perfil de investidor', null],
  ['/assistants', 'Assistentes e avisos', null],
];

const APP_ROUTES: RouteCase[] = [
  ['/', 'Painel', null],
  ['/spending', 'Gastos', null],
  ['/spending/tx-1', 'Lançamento', 'tx-1'],
  ['/spending/subscriptions', 'Assinaturas', null],
  ['/spending/subscriptions/calendar', 'Calendário de cobranças', null],
  ['/spending/subscriptions/sub-1', 'Assinatura', 'sub-1'],
  ['/investments', 'Investimentos', null],
  ['/investments/positions', 'Posições', null],
  ['/investments/allocation', 'Alocação', null],
  ['/investments/exposure', 'Exposição por país', null],
  ['/investments/asset/PETR4', 'Ativo', 'PETR4'],
  ['/investments/properties', 'Bens', null],
  ['/investments/properties/prop-1', 'Bem', 'prop-1'],
  ['/chat', 'Conversas', null],
  ['/chat/conv-1', 'Conversa', 'conv-1'],
  ['/more', 'Mais', null],
  ['/budgets', 'Tetos de gasto', null],
  ['/budgets/budget-1', 'Teto de gasto', 'budget-1'],
  ['/reports', 'Relatórios', null],
  ['/price-alerts', 'Alertas de preço', null],
  ['/price-alerts/alert-1', 'Alerta de preço', 'alert-1'],
  ['/simulator', 'Simulador', null],
  ['/simulator/retirement', 'Aposentadoria', null],
  ['/simulator/goal', 'Simular uma meta', null],
  ['/simulator/cut-expense', 'Cortar um gasto', null],
  ['/simulator/saved', 'Simulações salvas', null],
  ['/goals', 'Metas', null],
  ['/goals/goal-1', 'Meta', 'goal-1'],
  ['/notifications', 'Notificações', null],
  ['/account', 'Conta', null],
  ['/account/profile', 'Perfil', null],
  ['/account/banks', 'Bancos conectados', null],
  ['/account/banks/conn-1', 'Conexão bancária', 'conn-1'],
  ['/account/investor-profile', 'Perfil de investidor', null],
  ['/account/notification-channels', 'Canais de aviso', null],
  ['/account/plan', 'Plano', null],
  ['/connect-bank', 'Conectar banco', null],
  ['/new-budget', 'Novo teto de gasto', null],
  ['/new-price-alert', 'Novo alerta de preço', null],
  ['/new-manual-asset', 'Novo ativo manual', null],
  ['/new-property', 'Novo imóvel', null],
  ['/new-vehicle', 'Novo veículo', null],
  ['/new-goal', 'Nova meta', null],
  ['/resolve-duplicate/dup-1', 'Lançamento duplicado', 'dup-1'],
  ['/edit-category/tx-1', 'Editar categoria', 'tx-1'],
  ['/export-report', 'Exportar relatório', null],
];

async function expectRoute(url: string, title: string, param: string | null) {
  renderRouter('./app', { initialUrl: url });
  expect(await screen.findByRole('header', { name: title })).toBeOnTheScreen();
  if (param) expect(screen.getByText(param)).toBeOnTheScreen();
}

describe('routes', () => {
  const initialStatus = devSession.status;
  afterEach(() => {
    devSession.status = initialStatus;
  });

  describe('signed out → (auth)', () => {
    beforeEach(() => {
      devSession.status = 'signedOut';
    });
    it.each(AUTH_ROUTES)('%s → %s', expectRoute);
    it('redirects protected app routes to sign-in', async () => {
      await expectRoute('/budgets', 'Entrar', null);
    });
  });

  describe('onboarding → (onboarding)', () => {
    beforeEach(() => {
      devSession.status = 'onboarding';
    });
    it.each(ONBOARDING_ROUTES)('%s → %s', expectRoute);
    it('starts at the first step', async () => {
      await expectRoute('/', 'Conecte seus bancos', null);
    });
  });

  describe('signed in → (app)', () => {
    beforeEach(() => {
      devSession.status = 'signedIn';
    });
    it.each(APP_ROUTES)('%s → %s', expectRoute);
    it('does not expose auth screens', async () => {
      await expectRoute('/sign-in', 'Painel', null);
    });
    it('shows not-found for unknown URLs', async () => {
      await expectRoute('/does-not-exist', 'Página não encontrada', null);
    });
  });
});
