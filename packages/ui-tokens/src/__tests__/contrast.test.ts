import { colors } from '../colors';

/** WCAG 2.x relative luminance / contrast ratio. */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

const AA_TEXT = 4.5;
const AA_UI = 3;

const backgrounds = {
  'background.DEFAULT': colors.background.DEFAULT,
  'background.elevated': colors.background.elevated,
  'surface.DEFAULT': colors.surface.DEFAULT,
  'surface.muted': colors.surface.muted,
};

const textTokens = {
  'foreground.DEFAULT': colors.foreground.DEFAULT,
  'foreground.muted': colors.foreground.muted,
  'foreground.subtle': colors.foreground.subtle,
  'brand.DEFAULT': colors.brand.DEFAULT,
  'positive.DEFAULT': colors.positive.DEFAULT,
  'negative.DEFAULT': colors.negative.DEFAULT,
  'warning.DEFAULT': colors.warning.DEFAULT,
  'info.DEFAULT': colors.info.DEFAULT,
};

const textOnBackground = Object.entries(textTokens).flatMap(([text, fg]) =>
  Object.entries(backgrounds).map(([bg, bgColor]) => [text, bg, fg, bgColor] as const),
);

describe('WCAG AA contrast (dark theme)', () => {
  it.each(textOnBackground)('%s on %s', (_text, _bg, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it.each([
    ['foreground.DEFAULT', colors.foreground.DEFAULT],
    ['foreground.muted', colors.foreground.muted],
    ['foreground.subtle', colors.foreground.subtle],
  ])('%s on surface.pressed', (_name, fg) => {
    expect(contrast(fg, colors.surface.pressed)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it.each([
    ['brand.solid', colors.brand.foreground, colors.brand.solid],
    ['brand.pressed', colors.brand.foreground, colors.brand.pressed],
    ['negative.solid', colors.negative.foreground, colors.negative.solid],
    ['negative.pressed', colors.negative.foreground, colors.negative.pressed],
    ['positive (filled)', colors.positive.foreground, colors.positive.DEFAULT],
    ['warning (filled)', colors.warning.foreground, colors.warning.DEFAULT],
    ['info (filled)', colors.info.foreground, colors.info.DEFAULT],
  ])('text on %s', (_name, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it.each([
    ['brand', colors.brand.DEFAULT, colors.brand.muted],
    ['positive', colors.positive.DEFAULT, colors.positive.muted],
    ['negative', colors.negative.DEFAULT, colors.negative.muted],
    ['warning', colors.warning.DEFAULT, colors.warning.muted],
    ['info', colors.info.DEFAULT, colors.info.muted],
  ])('%s badge (text on muted tint)', (_name, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('focus ring is visible against backgrounds (3:1)', () => {
    for (const bg of Object.values(backgrounds)) {
      expect(contrast(colors.border.focus, bg)).toBeGreaterThanOrEqual(AA_UI);
    }
  });
});
