import { TranscriptionSchema, type Transcription } from '@guara/types';

import { ApiError, errorFromResponse, getAuthHeaders } from './api';
import { env } from './env';

/**
 * Sends a recorded question to `POST /v1/chat/transcriptions` (multipart) and returns the text
 * for the user to review. Every failure is an `ApiError` (pt-BR message).
 */
export async function transcribeAudio(uri: string, signal?: AbortSignal): Promise<Transcription> {
  const form = new FormData();
  // React Native's FormData takes a { uri, name, type } file part.
  form.append('audio', { uri, name: 'pergunta.m4a', type: 'audio/m4a' } as unknown as Blob);
  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}/v1/chat/transcriptions`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: form,
      signal,
    });
  } catch {
    throw new ApiError('network');
  }
  if (!response.ok) throw await errorFromResponse(response);
  const parsed = TranscriptionSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) throw new ApiError('internal');
  return parsed.data;
}
