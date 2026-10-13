/**
 * Unlock with the face, the fingerprint or the device passcode (expo-local-authentication,
 * included in Expo Go). In Expo Go on iOS, Face ID is not available and falls back to the
 * passcode; a development build needs NSFaceIDUsageDescription (app.config plugin).
 */
import {
  AuthenticationType,
  authenticateAsync,
  hasHardwareAsync,
  isEnrolledAsync,
  supportedAuthenticationTypesAsync,
} from 'expo-local-authentication';

/** What this device unlocks with (`none`: no sensor or nothing enrolled). */
export type BiometricKind = 'face' | 'fingerprint' | 'none';

export async function biometricKind(): Promise<BiometricKind> {
  try {
    if (!(await hasHardwareAsync()) || !(await isEnrolledAsync())) return 'none';
    const types = await supportedAuthenticationTypesAsync();
    if (types.includes(AuthenticationType.FACIAL_RECOGNITION)) return 'face';
    return types.length > 0 ? 'fingerprint' : 'none';
  } catch {
    return 'none';
  }
}

export type UnlockResult = 'success' | 'cancelled' | 'failed';

/**
 * Asks for the face or fingerprint; with `passcode`, the system goes straight to (or also
 * offers) the device passcode.
 */
export async function authenticate({ passcode }: { passcode: boolean }): Promise<UnlockResult> {
  try {
    const result = await authenticateAsync({
      promptMessage: 'Desbloquear o Guará',
      cancelLabel: 'Cancelar',
      fallbackLabel: 'Usar a senha do aparelho',
      disableDeviceFallback: !passcode,
    });
    if (result.success) return 'success';
    return result.error === 'user_cancel' || result.error === 'system_cancel'
      ? 'cancelled'
      : 'failed';
  } catch {
    return 'failed';
  }
}
