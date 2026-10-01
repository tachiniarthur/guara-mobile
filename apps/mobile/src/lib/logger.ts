/**
 * Minimal logger. Rules:
 * - `message` must be a static string — never interpolate user data into it.
 * - `context` is redacted: values under sensitive keys (tokens, documents, amounts…)
 *   are replaced before printing.
 * - debug/info are dropped outside development.
 */
type LogContext = Record<string, unknown>;

const SENSITIVE_KEY =
  /token|password|secret|authorization|cookie|session|cpf|cnpj|email|phone|account|card|balance|amount|key/i;
const REDACTED = '[redacted]';
const MAX_DEPTH = 4;

export function redact(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return '[truncated]';
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));
  if (value instanceof Error) return { name: value.name, message: value.message };
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        SENSITIVE_KEY.test(key) ? REDACTED : redact(item, depth + 1),
      ]),
    );
  }
  return value;
}

function print(level: 'debug' | 'info' | 'warn' | 'error', message: string, context?: LogContext) {
  const args = context ? [message, redact(context)] : [message];
  switch (level) {
    case 'debug':
    case 'info':
      // eslint-disable-next-line no-console
      if (__DEV__) console.log(`[${level}]`, ...args);
      break;
    case 'warn':
      console.warn(...args);
      break;
    case 'error':
      // TODO(dev-build): forward to Sentry once @sentry/react-native is added.
      console.error(...args);
      break;
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => print('debug', message, context),
  info: (message: string, context?: LogContext) => print('info', message, context),
  warn: (message: string, context?: LogContext) => print('warn', message, context),
  error: (message: string, context?: LogContext) => print('error', message, context),
};
