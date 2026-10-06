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
const fileNameOf = (title: string) =>
  normalizeForSearch(title)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'guara';

/**
 * Renders the HTML as a PDF in the app's cache and opens the share sheet with it.
 */
export async function sharePdf(html: string, dialogTitle: string): Promise<boolean> {
  try {
    // Written from base64: on Android the app cannot read the print module's own folder.
    const { base64 } = await Print.printToFileAsync({ html, base64: true });
    if (!base64 || !(await Sharing.isAvailableAsync())) return false;
    const target = new File(Paths.cache, `${fileNameOf(dialogTitle)}.pdf`);
    target.write(base64, { encoding: 'base64' });
    await Sharing.shareAsync(target.uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle,
    });
    return true;
  } catch (error) {
    logger.error('PDF export failed', { error });
    return false;
  }
}
