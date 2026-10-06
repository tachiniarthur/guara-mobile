import * as DocumentPicker from 'expo-document-picker';
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

/** A file the user picked to send in the chat. */
export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
  /** Bytes; `null` when the system does not say. */
  size: number | null;
}

/** Photo of a document (camera) or an image from the library, for the chat. */
export async function pickChatImage(source: 'camera' | 'library'): Promise<PickedFile | null> {
  try {
    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return null;
    }
    const options = { mediaTypes: ['images' as const], quality: 0.8 };
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
    if (result.canceled) return null;
    const asset = result.assets[0];
    if (!asset) return null;
    return {
      uri: asset.uri,
      name: asset.fileName ?? `foto-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? 'image/jpeg',
      size: asset.fileSize ?? null,
    };
  } catch (error) {
    logger.error('Chat image picker failed', { error });
    return null;
  }
}

/** A PDF from the files of the device (extrato, fatura, nota fiscal). */
export async function pickPdf(): Promise<PickedFile | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (result.canceled) return null;
    const asset = result.assets[0];
    if (!asset) return null;
    return {
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? 'application/pdf',
      size: asset.size ?? null,
    };
  } catch (error) {
    logger.error('Document picker failed', { error });
    return null;
  }
}
