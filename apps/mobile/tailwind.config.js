// Design tokens live in @guara/ui-tokens (TypeScript). Tailwind loads this file
// through jiti, which transpiles the workspace package on the fly.
const { createJiti } = require('jiti');

const jiti = createJiti(__filename);
const {
  colors,
  spacing,
  radius,
  fontSize,
  fontFamily,
  typography,
  controlHeight,
  minTouchTarget,
  breakpoints,
} = jiti('@guara/ui-tokens');

const px = (value) => `${value}px`;
const mapValues = (object, fn) =>
  Object.fromEntries(Object.entries(object).map(([key, value]) => [key, fn(value)]));

/** Control heights and the minimum touch target, usable as h-*, min-h-*, w-*, min-w-*. */
const controlSizes = {
  ...Object.fromEntries(
    Object.entries(controlHeight).map(([key, value]) => [`control-${key}`, px(value)]),
  ),
  touch: px(minTouchTarget),
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    // Replace (not extend) so only tokenized values are available.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      background: colors.background,
      surface: colors.surface,
      border: colors.border,
      foreground: colors.foreground,
      disabled: colors.disabled,
      brand: colors.brand,
      positive: colors.positive,
      negative: colors.negative,
      warning: colors.warning,
      info: colors.info,
      overlay: colors.overlay,
      skeleton: colors.skeleton,
    },
    spacing: { ...mapValues(spacing, px), ...controlSizes },
    borderRadius: mapValues(radius, px),
    fontSize: {
      ...mapValues(fontSize, ([size, lineHeight]) => [px(size), { lineHeight: px(lineHeight) }]),
      // Semantic scale: text-display, text-title, text-subtitle, text-body, text-caption, text-label.
      ...mapValues(typography, (style) => [
        px(style.fontSize),
        { lineHeight: px(style.lineHeight), letterSpacing: px(style.letterSpacing) },
      ]),
    },
    // One family per weight (required by custom fonts on Android):
    // font-sans, font-sans-medium, font-sans-semibold, font-sans-bold.
    fontFamily: {
      sans: [fontFamily.regular],
      'sans-medium': [fontFamily.medium],
      'sans-semibold': [fontFamily.semibold],
      'sans-bold': [fontFamily.bold],
    },
    screens: mapValues(
      Object.fromEntries(Object.entries(breakpoints).filter(([, value]) => value > 0)),
      px,
    ),
    extend: {
      minHeight: controlSizes,
      minWidth: controlSizes,
    },
  },
  plugins: [],
};
