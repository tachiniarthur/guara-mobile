/** Heights of interactive controls (buttons, inputs, segmented controls) in dp. */
export const controlHeight = {
  sm: 36,
  md: 44,
  lg: 52,
} as const;

/** Minimum touch target (WCAG / platform guidelines). */
export const minTouchTarget = 44;

/** Icon sizes in dp. */
export const iconSize = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
} as const;

/** Avatar diameters in dp. */
export const avatarSize = {
  xs: 28,
  sm: 32,
  md: 40,
  lg: 46,
  xl: 56,
} as const;

/** Mobile bottom tab bar, tablet side rail and the chat side panel. */
export const navigationSize = {
  tabBarHeight: 84,
  railWidth: 88,
  /** The chat beside the pages (history or open conversation): one width everywhere. */
  chatPanelWidth: 360,
  /** Window width from which the chat docks beside the pages instead of opening full screen. */
  chatPanelMinWindow: 1100,
} as const;

export type ControlSize = keyof typeof controlHeight;
export type IconSize = keyof typeof iconSize;
export type AvatarSize = keyof typeof avatarSize;
