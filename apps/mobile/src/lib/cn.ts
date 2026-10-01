/**
 * Class name helper: conditional classes (clsx) + conflict resolution (tailwind-merge v2,
 * the line that supports Tailwind 3). The merge config knows our custom token names so that,
 * e.g., `text-body` (font size) and `text-foreground` (color) are not treated as conflicts.
 */
import { typography } from '@guara/ui-tokens';
import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const CONTROL_SIZES = ['control-sm', 'control-md', 'control-lg', 'touch'];

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: CONTROL_SIZES,
    },
    classGroups: {
      'font-size': [{ text: Object.keys(typography) }],
      'font-family': [{ font: ['sans', 'sans-medium', 'sans-semibold', 'sans-bold'] }],
      'min-h': [{ 'min-h': CONTROL_SIZES }],
      'min-w': [{ 'min-w': CONTROL_SIZES }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
