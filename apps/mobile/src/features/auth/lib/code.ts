/** The e-mail code: 6 digits, valid for 10 minutes, 5 tries, a new one after 60 seconds. */
export const CODE_LENGTH = 6;
export const CODE_TTL_MS = 10 * 60 * 1000;
export const MAX_ATTEMPTS = 5;
export const RESEND_SECONDS = 60;

/** Keeps only digits, at most 6 ("48 2" → "482"). */
export const onlyDigits = (text: string) => text.replace(/\D/g, '').slice(0, CODE_LENGTH);

/** "0:45". */
export function countdown(seconds: number): string {
  const safe = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

/** Plain e-mail check before asking for a code (the server has the final word). */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/** The code expired: older than 10 minutes. */
export const isExpired = (sentAt: number, now: number) => now - sentAt > CODE_TTL_MS;

/** "Restam 4 tentativas." / "Resta 1 tentativa." */
export function attemptsText(left: number): string {
  return left === 1 ? 'Resta 1 tentativa.' : `Restam ${left} tentativas.`;
}
