// Design tokens live in @guara/ui-tokens (TypeScript). Tailwind loads this file
// through jiti, which transpiles the workspace package on the fly.
const { createJiti } = require('jiti');

const jiti = createJiti(__filename);
const { colors, spacing, radius, fontSize, fontFamily, breakpoints } = jiti('@guara/ui-tokens');

const px = (value) => `${value}px`;
const mapValues = (object, fn) =>
  Object.fromEntries(Object.entries(object).map(([key, value]) => [key, fn(value)]));

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
      brand: colors.brand,
      positive: colors.positive,
      negative: colors.negative,
      warning: colors.warning,
      info: colors.info,
    },
    spacing: mapValues(spacing, px),
    borderRadius: mapValues(radius, px),
    fontSize: mapValues(fontSize, ([size, lineHeight]) => [
      px(size),
      { lineHeight: px(lineHeight) },
    ]),
    fontFamily: mapValues(fontFamily, (family) => [family]),
    screens: mapValues(
      Object.fromEntries(Object.entries(breakpoints).filter(([, value]) => value > 0)),
      px,
    ),
    extend: {},
  },
  plugins: [],
};
