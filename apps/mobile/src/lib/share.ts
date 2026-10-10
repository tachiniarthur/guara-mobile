import { normalizeForSearch } from '@guara/utils';
import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';

import { logger } from './logger';

/** System share sheet with a text (summaries, never balances). */
export async function shareText(message: string, title?: string): Promise<boolean> {
  try {
    const result = await Share.share({ message, title });
    return result.action === Share.sharedAction;
  } catch (error) {
    logger.error('Share failed', { error });
    return false;
  }
}

/** "Gastos de setembro" → "gastos-de-setembro". */
export const fileNameOf = (title: string) =>
  normalizeForSearch(title)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'guara';

const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function bytesToBase64(bytes: Uint8Array): string {
  let output = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const a = bytes[index] ?? 0;
    const b = bytes[index + 1];
    const c = bytes[index + 2];
    const triple = (a << 16) | ((b ?? 0) << 8) | (c ?? 0);
    output += BASE64[(triple >> 18) & 63];
    output += BASE64[(triple >> 12) & 63];
    output += b === undefined ? '=' : BASE64[(triple >> 6) & 63];
    output += c === undefined ? '=' : BASE64[triple & 63];
  }
  return output;
}

/** A file written to the app's cache, ready to share. */
export interface SavedFile {
  uri: string;
  name: string;
  /** In bytes (`null` when the platform does not tell). */
  size: number | null;
  mimeType: string;
}

export type FileContent = { text: string } | { bytes: Uint8Array } | { base64: string };

/** Writes the content to `Paths.cache/<name>`, replacing an older file with the same name. */
export function saveFile(name: string, content: FileContent, mimeType: string): SavedFile {
  const target = new File(Paths.cache, name);
  if (target.exists) target.delete();
  if ('text' in content) target.write(content.text);
  else
    target.write('bytes' in content ? bytesToBase64(content.bytes) : content.base64, {
      encoding: 'base64',
    });
  return { uri: target.uri, name, size: target.size ?? null, mimeType };
}

/** Renders the HTML as a PDF in the app's cache. */
export async function savePdf(html: string, name: string): Promise<SavedFile> {
  // Written from base64: on Android the app cannot read the print module's own folder.
  const { base64 } = await Print.printToFileAsync({ html, base64: true });
  if (!base64) throw new Error('Empty PDF');
  return saveFile(name, { base64 }, 'application/pdf');
}

const UTI: Record<string, string> = {
  'application/pdf': 'com.adobe.pdf',
  'text/csv': 'public.comma-separated-values-text',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    'org.openxmlformats.spreadsheetml.sheet',
};

/** Opens the share sheet (save to files, send…) with a saved file. */
export async function shareFile(file: SavedFile, dialogTitle: string): Promise<boolean> {
  try {
    if (!(await Sharing.isAvailableAsync())) return false;
    await Sharing.shareAsync(file.uri, {
      mimeType: file.mimeType,
      UTI: UTI[file.mimeType],
      dialogTitle,
    });
    return true;
  } catch (error) {
    logger.error('File share failed', { error });
    return false;
  }
}

/**
 * Renders the HTML as a PDF in the app's cache and opens the share sheet with it.
 */
export async function sharePdf(html: string, dialogTitle: string): Promise<boolean> {
  try {
    const file = await savePdf(html, `${fileNameOf(dialogTitle)}.pdf`);
    return await shareFile(file, dialogTitle);
  } catch (error) {
    logger.error('PDF export failed', { error });
    return false;
  }
}
