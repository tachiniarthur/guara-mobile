import type { AssistantId } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import type { ImageSourcePropType } from 'react-native';

/** Animal names, portraits and scenes are used ONLY in the assistants/chat UI. */
export interface AssistantMeta {
  id: AssistantId;
  name: string;
  /** Article of the name ("a Capivara", "o Pacu"). */
  article: 'a' | 'o';
  scientificName: string;
  /** Area of the money it takes care of ("Gastos", "Investimentos"…). */
  area: string;
  /** Longer area used by the tablet rail ("Coordena a equipe", "Metas e objetivos"). */
  railLabel: string;
  /** What it does, in one sentence (onboarding). */
  description: string;
  /** Biome shown over the scene ("Cerrado", "Pantanal"…). */
  biome: string;
  /** Ring color of the portrait. */
  ringColor: string;
  /** Round portrait. */
  avatar: ImageSourcePropType;
  /** Wide scene in its biome (cards of the team). */
  scene: ImageSourcePropType;
}

export const ASSISTANTS: Record<AssistantId, AssistantMeta> = {
  capivara: {
    id: 'capivara',
    name: 'Capivara',
    article: 'a',
    scientificName: 'Hydrochoerus hydrochaeris',
    area: 'Coordenação',
    railLabel: 'Coordena a equipe',
    description: 'Coordena a equipe: recebe sua pergunta e chama o assistente certo.',
    biome: 'Pantanal',
    ringColor: colors.biome.capivara,
    avatar: require('@assets/images/assistants/capivara.jpg'),
    scene: require('@assets/images/scenes/capivara.jpg'),
  },
  tamandua: {
    id: 'tamandua',
    name: 'Tamanduá',
    article: 'o',
    scientificName: 'Myrmecophaga tridactyla',
    area: 'Gastos',
    railLabel: 'Gastos',
    description: 'Organiza seus gastos e responde quanto foi para onde.',
    biome: 'Cerrado',
    ringColor: colors.biome.tamandua,
    avatar: require('@assets/images/assistants/tamandua.jpg'),
    scene: require('@assets/images/scenes/tamandua.jpg'),
  },
  pacu: {
    id: 'pacu',
    name: 'Pacu',
    article: 'o',
    scientificName: 'Piaractus mesopotamicus',
    area: 'Investimentos',
    railLabel: 'Investimentos',
    description: 'Tira dúvidas, monta simulações e analisa sua carteira.',
    biome: 'Pantanal',
    ringColor: colors.biome.pacu,
    avatar: require('@assets/images/assistants/pacu.jpg'),
    scene: require('@assets/images/scenes/pacu.jpg'),
  },
  caramelo: {
    id: 'caramelo',
    name: 'Caramelo',
    article: 'o',
    scientificName: 'Canis lupus familiaris',
    area: 'Alertas de preço',
    railLabel: 'Alertas de preço',
    description: 'Vigia os preços que você escolher e avisa na hora.',
    biome: 'Cidade',
    ringColor: colors.biome.caramelo,
    avatar: require('@assets/images/assistants/caramelo.jpg'),
    scene: require('@assets/images/scenes/caramelo.jpg'),
  },
  quero_quero: {
    id: 'quero_quero',
    name: 'Quero-quero',
    article: 'o',
    scientificName: 'Vanellus chilensis',
    area: 'Fora do padrão',
    railLabel: 'Fora do padrão',
    description: 'Percebe compras fora do seu padrão e confirma com você.',
    biome: 'Pampa',
    ringColor: colors.biome.quero_quero,
    avatar: require('@assets/images/assistants/quero-quero.jpg'),
    scene: require('@assets/images/scenes/quero-quero.jpg'),
  },
  onca: {
    id: 'onca',
    name: 'Onça',
    article: 'a',
    scientificName: 'Panthera onca',
    area: 'Metas',
    railLabel: 'Metas e objetivos',
    description: 'Acompanha suas metas, como viagem e reserva, e avisa se o ritmo está bom.',
    biome: 'Amazônia',
    ringColor: colors.biome.onca,
    avatar: require('@assets/images/assistants/onca.jpg'),
    scene: require('@assets/images/scenes/onca.jpg'),
  },
};

/** Order of the team in lists (the coordinator first). */
export const ASSISTANT_ORDER: AssistantId[] = [
  'capivara',
  'tamandua',
  'pacu',
  'caramelo',
  'quero_quero',
  'onca',
];

/** Onboarding order (as in the design). */
export const ONBOARDING_ASSISTANT_ORDER: AssistantId[] = [
  'capivara',
  'pacu',
  'caramelo',
  'tamandua',
  'quero_quero',
  'onca',
];

/** "com a Capivara", "ao Pacu", "à Onça": the name with its article after a preposition. */
export function assistantWith(preposition: 'com' | 'a', id: AssistantId): string {
  const { name, article } = ASSISTANTS[id];
  if (preposition === 'a') return `${article === 'a' ? 'à' : 'ao'} ${name}`;
  return `com ${article} ${name}`;
}

export const isAssistantId = (value: string): value is AssistantId => value in ASSISTANTS;
