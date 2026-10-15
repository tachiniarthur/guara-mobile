/**
 * Dark theme palette ("mata à noite"), the only theme. Names in comments are the design's.
 *
 * - Tucano (brand) is the primary action; Urucum (negative) is the alert; Folha (positive) is gain;
 *   Arara-azul (info) is data and incoming money.
 * - Gain and loss never rely on color alone: always a sign, a label or an arrow.
 *
 * Contrast rules (enforced by `__tests__/contrast.test.ts`):
 * - text tokens reach WCAG AA (4.5:1) on every background/surface they are used on;
 * - `*.solid` are filled backgrounds, paired with `*.foreground` text (AA);
 * - `*.muted` are tinted backgrounds, paired with the `DEFAULT` text color (AA).
 */
export const colors = {
  background: {
    /** Mata à noite — app background. */
    DEFAULT: '#0B110E',
    /** Folha escura — tab bar, rail and sticky footers over content. */
    elevated: '#121A16',
    sunken: '#070B09',
  },
  surface: {
    /** Folha escura — cards and panels. */
    DEFAULT: '#121A16',
    /** Sombra — raised blocks, chat bubbles, progress tracks, segmented controls. */
    muted: '#1A241F',
    /** Inputs, menus and option rows. */
    input: '#16201B',
    pressed: '#1F2B25',
  },
  border: {
    /** Musgo — card borders and dividers. */
    DEFAULT: '#25322B',
    /** Líquen — outline of fields and buttons. */
    strong: '#34443B',
    /** Focus ring and selected outline. */
    focus: '#F2C230',
  },
  foreground: {
    /** Areia — main text. */
    DEFAULT: '#F2EFE6',
    /** Labels inside data lists. */
    soft: '#D4DBD5',
    /** Névoa — supporting text. */
    muted: '#BDC6BE',
    /** Seriema — captions and metadata. */
    subtle: '#93A198',
    inverse: '#0B110E',
  },
  /** Disabled controls (WCAG exempts disabled text from contrast requirements). */
  disabled: {
    background: '#1A241F',
    foreground: '#5E6E64',
  },
  /** Tucano — primary action, attention, the user's chat bubble. */
  brand: {
    DEFAULT: '#F2C230',
    solid: '#F2C230',
    pressed: '#D9AC22',
    muted: '#332A12',
    /** Outline of the selected card ("Seu perfil" among the 4 profiles). */
    border: '#6B5A1E',
    foreground: '#0B110E',
  },
  /** Folha — gain, calm month, buy. */
  positive: {
    DEFAULT: '#6CC08E',
    solid: '#6CC08E',
    muted: '#16301F',
    foreground: '#0B110E',
  },
  /** Urucum — alert, out of pattern, tight month, sell. */
  negative: {
    DEFAULT: '#FF6A50',
    solid: '#FF6A50',
    pressed: '#E85A41',
    muted: '#3A1C16',
    /** Outline of Urucum text buttons ("Não reconheço"). */
    border: '#5A2A22',
    foreground: '#0B110E',
  },
  warning: {
    DEFAULT: '#F2C230',
    muted: '#332A12',
    /** Outline of cards that need attention ("Renove em breve"). */
    border: '#5C4A1A',
    foreground: '#0B110E',
  },
  /** Arara-azul — data, incoming money, charts. */
  info: {
    DEFAULT: '#6DB3EC',
    muted: '#172838',
    foreground: '#0B110E',
  },
  /** Mata — hero highlight (logo disc, balance hero). */
  hero: {
    DEFAULT: '#1B4535',
    ring: '#23513C',
    /** Wordmark over the Mata header; strong numbers in hero captions. */
    foreground: '#FFFFFF',
    /** Label over the Mata texture ("Guardado nas metas"). */
    label: '#C5D8CB',
    /** Caption over the Mata texture ("Depósitos planejados…"). */
    caption: '#E4EEE6',
  },
  /** Biome ring of each assistant's portrait (only in the assistants and chat UI). */
  biome: {
    capivara: '#5C4A2E',
    tamandua: '#6A4428',
    pacu: '#23513C',
    caramelo: '#1F4A4E',
    quero_quero: '#44502A',
    onca: '#7A3B1E',
  },
  /** Tiles with the asset's mark ("BR", "ETF", "₿") on the asset page. */
  assetMark: {
    mata: '#0F5C3A',
    terra: '#6A4428',
    ouro: '#7A5A12',
    jabuticaba: '#3A2A5E',
    rio: '#1F4A6E',
  },
  /** Interactive globe ("Onde seu dinheiro está no mundo"): ocean gradient and land dots. */
  globe: {
    oceanLight: '#1D2B24',
    oceanDark: '#0E1512',
    land: '#4A5E52',
    /** Chips of the places over the globe ("Brasil · 82%"): Mata à noite at 80%. */
    chip: 'rgba(11, 17, 14, 0.8)',
  },
  /** Translucent dark buttons over the Mata texture ("Editar" on the profile card). */
  veil: 'rgba(11, 17, 14, 0.7)',
  /** Thin ring inside the asset mark tiles. */
  markRing: 'rgba(242, 239, 230, 0.2)',
  /** Brazilian flag (origin of an asset). */
  flag: {
    green: '#1F8A4C',
    yellow: '#F2C230',
    blue: '#2A5CA8',
  },
  /** Backdrop behind sheets, dialogs and the account menu. */
  overlay: 'rgba(5, 9, 7, 0.72)',
  /** Lighter backdrops behind the chat opened over a page (phone sheet / tablet panel). */
  chatOverlay: { phone: 'rgba(5, 9, 7, 0.6)', tablet: 'rgba(5, 9, 7, 0.45)' },
  /** Dark scrims over photos (badges on the assistants' scenes). */
  scrim: {
    soft: 'rgba(0, 0, 0, 0.45)',
    strong: 'rgba(0, 0, 0, 0.55)',
    /** Text on scrims. */
    foreground: '#F4F1EA',
  },
  /** Drop shadows of floating menus. */
  shadow: '#000000',
  /** Skeleton placeholder base. */
  skeleton: {
    DEFAULT: '#1A241F',
    /** "Carregando": cards and controls drawn over the screen's own layout. */
    surface: '#16201B',
    border: '#1E2A23',
    /** Text turned into blocks. */
    text: '#25322B',
  },
  /** Thin ring drawn inside avatars. */
  avatarRing: 'rgba(242, 239, 230, 0.35)',
  /** Chart series. Entradas use info, Saídas use `chart.out`. */
  chart: {
    in: '#6DB3EC',
    /** Past months behind the current one (muted Arara-azul). */
    inMuted: '#3E6A8C',
    out: '#E0935A',
    grid: '#25322B',
    axis: '#34443B',
    /** Categorical series (keep order stable across the app). */
    series: ['#F2EFE6', '#F2C230', '#6DB3EC', '#FF6A50', '#6CC08E', '#E0935A'],
  },
} as const;

export type Colors = typeof colors;
