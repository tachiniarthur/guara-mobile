/** Fixed user-facing texts (pt-BR). */
export { EMPTY } from '@guara/utils';

export const AI_DISCLAIMER = 'A IA pode errar. Nada aqui é recomendação de investimento.';

/** Tab labels are neutral — animal names appear only in the assistants/chat UI. */
export const TAB_LABELS = {
  home: 'Início',
  spending: 'Gastos',
  investments: 'Investimentos',
  assistants: 'Assistentes',
  more: 'Mais',
} as const;

export const COMMON_COPY = {
  notFound: 'Página não encontrada',
  backToHome: 'Voltar ao início',
  devRouteMap: 'Mapa de rotas (dev)',
  devUiCatalog: 'Catálogo de UI (dev)',
  devData: 'Dados falsos (dev)',
} as const;

export const FEEDBACK_COPY = {
  errorTitle: 'Não foi possível carregar',
  errorDescription: 'Verifique sua conexão e tente de novo.',
  retry: 'Tentar de novo',
  offline: 'Você está sem conexão. Algumas informações podem estar desatualizadas.',
  confirm: 'Confirmar',
  cancel: 'Cancelar',
  close: 'Fechar',
  loading: 'Carregando',
} as const;
