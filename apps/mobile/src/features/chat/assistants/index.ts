import type { AssistantId } from '@guara/types';
import type { ImageSourcePropType } from 'react-native';

/** Animal names and avatars are used ONLY in the assistants/chat UI. */
export interface AssistantMeta {
  id: AssistantId;
  name: string;
  /** What the assistant takes care of (pt-BR). */
  role: string;
  avatar: ImageSourcePropType;
}

export const ASSISTANTS: Record<AssistantId, AssistantMeta> = {
  capivara: {
    id: 'capivara',
    name: 'Capivara',
    role: 'Coordena a conversa e chama o assistente certo',
    avatar: require('@assets/images/assistants/capivara.png'),
  },
  tamandua: {
    id: 'tamandua',
    name: 'Tamanduá',
    role: 'Gastos',
    avatar: require('@assets/images/assistants/tamandua.png'),
  },
  pacu: {
    id: 'pacu',
    name: 'Pacu',
    role: 'Investimentos e simulações',
    avatar: require('@assets/images/assistants/pacu.png'),
  },
  caramelo: {
    id: 'caramelo',
    name: 'Caramelo',
    role: 'Alertas de preço',
    avatar: require('@assets/images/assistants/caramelo.png'),
  },
  'quero-quero': {
    id: 'quero-quero',
    name: 'Quero-quero',
    role: 'Compras fora do padrão',
    avatar: require('@assets/images/assistants/quero-quero.png'),
  },
  onca: {
    id: 'onca',
    name: 'Onça',
    role: 'Metas',
    avatar: require('@assets/images/assistants/onca.png'),
  },
};

export const ASSISTANT_ORDER: AssistantId[] = [
  'capivara',
  'tamandua',
  'pacu',
  'caramelo',
  'quero-quero',
  'onca',
];
