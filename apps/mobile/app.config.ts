import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * App variants selected by APP_VARIANT. While the project runs on Expo Go these
 * identifiers are ignored, but they are ready for the development-build migration.
 */
type AppVariant = 'development' | 'preview' | 'production';

const BUNDLE_ID = 'br.com.guara.app';
const BACKGROUND_COLOR = '#0B0D10';

const VARIANTS: Record<AppVariant, { name: string; idSuffix: string; icon: string }> = {
  development: {
    name: 'Guará (Dev)',
    idSuffix: '.dev',
    icon: './assets/images/brand/icon-development.png',
  },
  preview: {
    name: 'Guará (Preview)',
    idSuffix: '.preview',
    icon: './assets/images/brand/icon-preview.png',
  },
  production: {
    name: 'Guará',
    idSuffix: '',
    icon: './assets/images/brand/icon.png',
  },
};

function resolveVariant(value: string | undefined): AppVariant {
  return value === 'preview' || value === 'production' ? value : 'development';
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = resolveVariant(process.env.APP_VARIANT);
  const { name, idSuffix, icon } = VARIANTS[variant];
  const identifier = `${BUNDLE_ID}${idSuffix}`;

  return {
    ...config,
    name,
    slug: 'guara',
    version: '1.0.0',
    // Lets the same JS run on phones and tablets in any orientation (layout adapts).
    orientation: 'default',
    icon,
    scheme: 'guara',
    userInterfaceStyle: 'dark',
    backgroundColor: BACKGROUND_COLOR,
    // `newArchEnabled` no longer exists: the New Architecture is mandatory since SDK 55.
    ios: {
      bundleIdentifier: identifier,
      supportsTablet: true,
      usesAppleSignIn: true,
      config: { usesNonExemptEncryption: false },
    },
    android: {
      package: identifier,
      adaptiveIcon: {
        backgroundColor: BACKGROUND_COLOR,
        foregroundImage: './assets/images/brand/android-icon-foreground.png',
        backgroundImage: './assets/images/brand/android-icon-background.png',
        monochromeImage: './assets/images/brand/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
    },
    // Only plugins of installed, Expo Go–compatible packages. Expo Go ignores native
    // config, but these are applied as-is when migrating to a development build.
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: BACKGROUND_COLOR,
          image: './assets/images/brand/splash-icon.png',
          imageWidth: 96,
        },
      ],
      'expo-font',
      'expo-system-ui',
      'expo-localization',
      'expo-web-browser',
      'expo-apple-authentication',
      'expo-sqlite',
      [
        'expo-secure-store',
        {
          configureAndroidBackup: true,
          faceIDPermission: 'Permitir que o Guará use o Face ID para proteger seus dados.',
        },
      ],
      [
        'expo-notifications',
        {
          color: '#D9622B',
          defaultChannel: 'default',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      appVariant: variant,
    },
  };
};
