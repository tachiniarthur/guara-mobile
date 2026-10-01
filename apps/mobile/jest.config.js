const expoPreset = require('jest-expo/jest-preset');

/** ESM-only libraries that must be transpiled, on top of jest-expo's defaults. */
const EXTRA_TRANSFORMED_PACKAGES = [
  'nativewind',
  'react-native-css-interop',
  'lucide-react-native',
  'victory-native',
  '@shopify',
  '@gorhom',
  'react-native-marked',
  '@jsamr',
  '@supabase',
];

const [defaultPattern, ...otherPatterns] = expoPreset.transformIgnorePatterns;

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  transform: {
    // Some libraries (e.g. lucide-react-native) ship their React Native entry as .mjs.
    '\\.mjs$': expoPreset.transform['\\.[jt]sx?$'],
  },
  transformIgnorePatterns: [
    defaultPattern.replace('))', `|${EXTRA_TRANSFORMED_PACKAGES.join('|')}))`),
    ...otherPatterns,
  ],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/__tests__/mocks/style.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
  },
};
