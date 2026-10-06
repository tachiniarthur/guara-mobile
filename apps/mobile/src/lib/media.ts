import * as ImagePicker from 'expo-image-picker';

import { logger } from './logger';

/**
 * Lets the user pick a square photo from the library (profile picture). Returns the local URI,
 * or `null` when cancelled or when it fails.
 */
export async function pickSquarePhoto(): Promise<string | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return null;
    return result.assets[0]?.uri ?? null;
  } catch (error) {
    logger.error('Photo picker failed', { error });
    return null;
  }
}
