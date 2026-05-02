/**
 * Structured Cloud Logging utility for Google Cloud Run.
 *
 * When running on Cloud Run, `console.log` / `console.error` output is
 * automatically ingested by Google Cloud Logging.  Emitting structured
 * JSON (with a `severity` field) lets Cloud Logging classify entries
 * correctly and makes them filterable in the Logs Explorer.
 *
 * @see https://cloud.google.com/run/docs/logging
 */

export type LogSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';

export interface StructuredLogEntry {
  severity: LogSeverity;
  message: string;
  timestamp: string;
  component?: string;
  [key: string]: unknown;
}

/** Build a structured log entry compatible with Google Cloud Logging. */
const buildEntry = (
  severity: LogSeverity,
  message: string,
  extra: Record<string, unknown> = {},
): StructuredLogEntry => ({
  severity,
  message,
  timestamp: new Date().toISOString(),
  component: 'elected-frontend',
  ...extra,
});

/**
 * Cloud-compatible structured logger.
 *
 * In production (Cloud Run) each call produces a single JSON line that
 * Cloud Logging parses automatically.  In development the output is
 * human-readable via the browser console.
 */
export const cloudLog = {
  /** Log an informational message. */
  info(message: string, extra?: Record<string, unknown>) {
    const entry = buildEntry('INFO', message, extra);
    console.log(JSON.stringify(entry));
  },

  /** Log a warning. */
  warn(message: string, extra?: Record<string, unknown>) {
    const entry = buildEntry('WARNING', message, extra);
    console.warn(JSON.stringify(entry));
  },

  /** Log an error. */
  error(message: string, extra?: Record<string, unknown>) {
    const entry = buildEntry('ERROR', message, extra);
    console.error(JSON.stringify(entry));
  },

  /** Log a debug message (development only). */
  debug(message: string, extra?: Record<string, unknown>) {
    if (import.meta.env.DEV) {
      const entry = buildEntry('DEBUG', message, extra);
      console.debug(JSON.stringify(entry));
    }
  },
};
