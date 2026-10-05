import { colors } from '@guara/ui-tokens';
import Svg, { Path } from 'react-native-svg';

/**
 * Stroke icons of the design (24×24 grid, round caps and joins). Paths copied from the
 * artifact so every icon matches it exactly.
 */
export const ICON_PATHS = {
  close: ['M6 6l12 12M18 6 6 18'],
  home: ['M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z'],
  search: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4'],
  check: ['M5 12l5 5L20 7'],
  checkThin: ['M20 6 9 17l-5-5'],
  alertTriangle: [
    'M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  ],
  copy: ['M8 8h12v12H8zM4 16V4h12'],
  chevronLeft: ['M15 18l-6-6 6-6'],
  chevronRight: ['M9 6l6 6-6 6'],
  chevronDown: ['M6 9l6 6 6-6'],
  plus: ['M12 5v14M5 12h14'],
  arrowUp: ['M12 19V5M5 12l7-7 7 7'],
  arrowDown: ['M12 5v14M19 12l-7 7-7-7'],
  arrowRight: ['M5 12h13M13 6l6 6-6 6'],
  arrowUpRight: ['M7 17 17 7M9 7h8v8'],
  arrowDownLeft: ['M17 7L7 17M7 9v8h8'],
  wallet: [
    'M3 7h15a3 3 0 0 1 3 3v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7V6a2 2 0 0 1 2-2h11v3M16.5 14h.01',
  ],
  message: ['M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z'],
  trendingUp: ['M3 17l6-6 4 4 8-8M15 7h6v6'],
  users: [
    'M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 20v-1a4 4 0 0 0-3-3.9M15.5 4.1a3.5 3.5 0 0 1 0 6.8',
  ],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0'],
  bell: ['M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0'],
  bellAlert: ['M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 21h4'],
  repeat: ['M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h16M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4'],
  sprout: [
    'M12 22v-8M12 14c-4.4 0-7-2.9-7-6.2C5 4.4 8.1 2 12 2s7 2.4 7 5.8c0 3.3-2.6 6.2-7 6.2zM12 5v6M9 8h6',
  ],
  barChart: ['M6 20V11M12 20V5M18 20v-6M3 20h18'],
  pencil: ['M4 20h4L19 9l-4-4L4 16zM13 7l4 4'],
  info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01'],
  infoLarge: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-5M12 8h.01'],
  fileText: ['M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6'],
  moreHorizontal: ['M5 12h.01M12 12h.01M19 12h.01'],
  globe: [
    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18',
  ],
  dollar: [
    'M12 2v20M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.8 7 7s2.2 3 5 3.6 5 1.5 5 3.9-2.2 3.5-5 3.5-5-1.1-5-3',
  ],
  shield: ['M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z'],
  paperclip: ['M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7'],
  atSign: ['M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1'],
  mic: ['M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM19 11a7 7 0 0 1-14 0M12 18v3'],
  calendar: ['M4 6h16v14H4zM4 10h16M8 3v4M16 3v4'],
  grid: ['M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'],
  eye: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
  merge: ['M6 3v6a6 6 0 0 0 6 6h6M15 12l3 3-3 3M6 21v-6'],
  car: [
    'M5 17h14M6 17v2M18 17v2M3 13l2-5a2 2 0 0 1 1.9-1.4h10.2A2 2 0 0 1 19 8l2 5v4H3zM7 13.5h.01M17 13.5h.01',
  ],
  link: [
    'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7L12 6.3M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  ],
  relink: [
    'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  ],
  refresh: ['M20 11a8 8 0 0 0-14.9-3M4 5v4h4M4 13a8 8 0 0 0 14.9 3M20 19v-4h-4'],
  smartphone: ['M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2'],
  laptop: ['M4 5h16v11H4zM2 19h20'],
  trash: ['M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13'],
  download: ['M12 4v11M7 10l5 5 5-5M4 20h16'],
  share: ['M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5'],
  tag: ['M3 12V4h8l10 10-8 8zM7.5 8h.01'],
  filter: ['M4 5h16l-6 8v6l-4-2v-4z'],
  sort: ['M8 4v16M4 8l4-4 4 4M16 20V4M12 16l4 4 4-4'],
  wifiOff: [
    'M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 5-2.6M19 12.5a10 10 0 0 0-2.4-1.7M12 20h.01',
  ],
  retry: ['M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5'],
  lock: ['M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4'],
  externalLink: ['M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2'],
  shieldCheck: ['M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4'],
  sparkle: [
    'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6',
  ],
  pause: ['M8 5v14M16 5v14'],
  flag: ['M5 21V4M5 4h11l-2 4 2 4H5'],
  target: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01'],
  scissors: [
    'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12',
  ],
} as const satisfies Record<string, readonly string[]>;

export type IconName = keyof typeof ICON_PATHS;

export interface IconProps {
  name: IconName;
  /** Width and height in dp (default 20). */
  size?: number;
  /** Stroke color (default: muted text). */
  color?: string;
  /** Stroke width on the 24 grid (the design uses 1.6; checks use 2–2.4). */
  strokeWidth?: number;
}

/** Decorative by default: give the parent control the accessible label. */
export function Icon({
  name,
  size = 20,
  color = colors.foreground.muted,
  strokeWidth = 1.6,
}: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {ICON_PATHS[name].map((d) => (
        <Path key={d} d={d} />
      ))}
    </Svg>
  );
}
