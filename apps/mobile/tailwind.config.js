// Design tokens live in @guara/ui-tokens (TypeScript). Tailwind loads this file
// through jiti, which transpiles the workspace package on the fly.
const { createJiti } = require('jiti');

const jiti = createJiti(__filename);
const { colors, spacing, radius, fontFamily, controlHeight, minTouchTarget, breakpoints } =
  jiti('@guara/ui-tokens');

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
      hero: colors.hero,
      overlay: colors.overlay,
      scrim: colors.scrim,
      skeleton: colors.skeleton,
    },
    spacing: { ...mapValues(spacing, px), ...controlSizes },
    borderRadius: mapValues(radius, px),
    // Font sizes in dp, named by value (`text-15`). Line height comes from the `Text` component
    // (ratio per variant); prefer `<Text size={15}>` over these classes.
    fontSize: Object.fromEntries(
      [9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 34, 36, 38, 44].map(
        (size) => [size, px(size)],
      ),
    ),
    // One family per weight (required by custom fonts on Android). Figtree: font-sans,
    // font-sans-medium… font-sans-extrabold. Fraunces: font-serif-semibold, -bold, -extrabold.
    fontFamily: {
      sans: [fontFamily.regular],
      'sans-italic': [fontFamily.italic],
      'sans-medium': [fontFamily.medium],
      'sans-semibold': [fontFamily.semibold],
      'sans-bold': [fontFamily.bold],
      'sans-extrabold': [fontFamily.extrabold],
      'serif-semibold': [fontFamily.serifSemibold],
      'serif-bold': [fontFamily.serifBold],
      'serif-bold-italic': [fontFamily.serifBoldItalic],
      'serif-extrabold': [fontFamily.serifExtrabold],
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
