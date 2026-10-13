import { isOnline } from '@/lib/network';

import type { ChatFile } from '../data';

/** The file did not go: how far it got ("a conexão caiu em 60%"). */
export class UploadError extends Error {
  constructor(readonly progress: number) {
    super('upload failed');
  }
}

/** Steps of the stand-in upload and the pause between them (ms). */
export const UPLOAD_TIMING = { steps: 5, step: 120 };

/**
 * Stand-in for the attachment upload while the API does not exist: it checks the connection at
 * each step and fails where it dropped. Swap it for the API upload (same progress callback).
 */
export async function uploadAttachment(
  _file: ChatFile,
  onProgress: (percent: number) => void,
): Promise<void> {
  for (let step = 0; step <= UPLOAD_TIMING.steps; step += 1) {
    const percent = Math.round((step / UPLOAD_TIMING.steps) * 100);
    if (!(await isOnline())) throw new UploadError(percent);
    onProgress(percent);
    if (step < UPLOAD_TIMING.steps) {
      await new Promise((resolve) => setTimeout(resolve, UPLOAD_TIMING.step));
    }
  }
}
