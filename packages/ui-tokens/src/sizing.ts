/** Heights of interactive controls (buttons, inputs, segmented controls) in dp. */
export const controlHeight = {
  sm: 36,
  md: 44,
  lg: 52,
} as const;

/** Minimum touch target (WCAG / platform guidelines). */
export const minTouchTarget = 44;

/** Lucide icon sizes in dp. */
export const iconSize = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

/** Avatar diameters in dp. */
export const avatarSize = {
  sm: 32,
  md: 40,
  lg: 56,
} as const;

export type ControlSize = keyof typeof controlHeight;
export type IconSize = keyof typeof iconSize;
export type AvatarSize = keyof typeof avatarSize;
