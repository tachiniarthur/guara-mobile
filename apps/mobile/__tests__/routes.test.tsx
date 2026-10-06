/**
 * Opens EVERY route of the app and checks its title (header).
 * Generated from the route table used to scaffold app/; keep in sync when adding routes.
 */
import { screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { devSession } from '@/providers/AuthProvider';

type RouteCase = [url: string, title: string, param: string | null];

const AUTH_ROUTES: RouteCase[] = [
  ['/sign-in', 'Bem-vindo ao Guará', null],
  ['/sign-up', 'Criar conta', null],
  ['/forgot-password', 'Recuperar senha', null],
  ['/terms', 'Termos de uso', null],
  ['/privacy', 'Política de privacidade', null],
];

const ONBOARDING_ROUTES: RouteCase[] = [
  ['/connect-banks', 'Conecte seus bancos', null],
  ['/connect/bradesco', 'Conectar Bradesco', null],
  ['/investor-profile', 'Perfil de investidor', null],
  ['/assistants', 'Conheça seus assistentes', null],
];

const APP_ROUTES: RouteCase[] = [
  ['/', 'Boa tarde, Arthur.', null],
  ['/spending', 'Gastos', null],
  ['/spending/transactions', 'Lançamentos', null],
  ['/spending/category/food', 'Alimentação', null],
  ['/spending/tx-eletronicos', 'Lançamento', null],
  ['/spending/tx-1', 'Lançamento', null],
  ['/spending/subscriptions', 'Assinaturas', null],
  ['/spending/subscriptions/calendar', 'Calendário de cobranças', null],
  ['/spending/subscriptions/sub-1', 'Assinatura', 'sub-1'],
  ['/investments', 'Investimentos', null],
  ['/investments/positions', 'Posições', null],
  ['/investments/allocation', 'Alocação', null],
  ['/investments/exposure', 'Exposição por país', null],
  ['/investments/asset/PETR4', 'Detalhes do ativo', null],
  ['/investments/asset/BOVA11/details', 'Detalhes do ativo', null],
  ['/investments/asset/HGLG11/events', 'Eventos corporativos', null],
  ['/investments/asset/HGLG11', 'HGLG11', null],
  ['/investments/properties', 'Bens', null],
  ['/investments/properties/apto', 'Apartamento em Pinheiros', null],
  ['/investments/properties/onix', 'Onix LT 2022', null],
  ['/chat', 'Conversas', null],
  ['/chat/gastos-de-setembro', 'Gastos de setembro', null],
  ['/assistants', 'Seus assistentes', null],
  ['/budgets', 'Tetos de gasto', null],
  ['/budgets/budget-1', 'Teto de gasto', 'budget-1'],
  ['/reports', 'Relatório', null],
  ['/reports/timeline', 'Linha do tempo', null],
  ['/alerts', 'Alertas', null],
  ['/price-alerts/alert-1', 'Alerta de preço', 'alert-1'],
  ['/investments/simulator', 'O caminho do seu futuro', null],
  ['/investments/simulator/retirement', 'O caminho do seu futuro', null],
  ['/investments/simulator/goal', 'Seu plano para a viagem', null],
  ['/investments/simulator/cut-expense', 'O que esse corte vira', null],
  ['/investments/simulator/saved', 'Simulações salvas', null],
  ['/goals', 'Suas metas', null],
  ['/goals/reserva', 'Reserva de emergência', null],
  ['/account', 'Meu perfil', null],
  ['/account/profile', 'Editar perfil', null],
  ['/account/banks', 'Bancos conectados', null],
  ['/account/banks/conn-1', 'Conexão bancária', 'conn-1'],
  ['/account/investor-profile', 'Refazer perfil', null],
  ['/account/notification-channels', 'Canais de aviso', null],
  ['/account/plan', 'Planos', null],
  ['/connect-bank', 'Conectar bancos', null],
  ['/malvo/bradesco', 'Conectar Bradesco', null],
  ['/malvo/itau?mode=renew', 'Renovar autorização do Itaú', null],
  ['/new-budget', 'Novo teto de gasto', null],
  ['/new-price-alert', 'Novo alerta de preço', null],
  ['/new-manual-asset', 'Adicionar investimento', null],
  ['/new-property', 'Cadastrar imóvel', null],
  ['/new-vehicle', 'Cadastrar veículo', null],
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
      await expectRoute('/budgets', 'Bem-vindo ao Guará', null);
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
      await expectRoute('/sign-in', 'Boa tarde, Arthur.', null);
    });
    it('shows not-found for unknown URLs', async () => {
      await expectRoute('/does-not-exist', 'Página não encontrada', null);
    });
  });
});
