/**
 * Structured logging utility for debugging auth and data persistence issues.
 * Provides categorized logging with timing, in-memory buffer for export.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogCategory = 'auth' | 'api' | 'workout' | 'data';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: Record<string, unknown>;
  durationMs?: number;
}

// In-memory ring buffer (last 100 entries) for debugging
const logBuffer: LogEntry[] = [];
const MAX_BUFFER = 100;

// Environment check for verbose logging
const isDev = import.meta.env.DEV;

function log(
  level: LogLevel,
  category: LogCategory,
  message: string,
  data?: Record<string, unknown>
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    data,
  };

  // Console output with category prefix
  const prefix = `[${category.toUpperCase()}]`;
  const logData = data ? data : '';

  if (level === 'error') {
    console.error(prefix, message, logData);
  } else if (level === 'warn') {
    console.warn(prefix, message, logData);
  } else if (level === 'debug' && isDev) {
    console.debug(prefix, message, logData);
  } else if (level === 'info') {
    console.log(prefix, message, logData);
  }

  // Add to buffer for export
  logBuffer.push(entry);
  if (logBuffer.length > MAX_BUFFER) {
    logBuffer.shift();
  }
}

// Category-specific logger helpers
function createCategoryLogger(category: LogCategory) {
  return {
    debug: (msg: string, data?: Record<string, unknown>) => log('debug', category, msg, data),
    info: (msg: string, data?: Record<string, unknown>) => log('info', category, msg, data),
    warn: (msg: string, data?: Record<string, unknown>) => log('warn', category, msg, data),
    error: (msg: string, data?: Record<string, unknown>) => log('error', category, msg, data),
  };
}

export const logger = {
  auth: createCategoryLogger('auth'),
  api: createCategoryLogger('api'),
  workout: createCategoryLogger('workout'),
  data: createCategoryLogger('data'),
};

/**
 * Timing wrapper for async operations.
 * Logs start, success with duration, or failure with duration.
 */
export async function timed<T>(
  category: LogCategory,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const categoryLogger = logger[category];

  categoryLogger.debug(`${operation} started`);

  try {
    const result = await fn();
    const durationMs = Math.round(performance.now() - start);
    categoryLogger.info(`${operation} completed`, { durationMs });
    return result;
  } catch (error) {
    const durationMs = Math.round(performance.now() - start);
    categoryLogger.error(`${operation} failed`, {
      durationMs,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Export all buffered logs for debugging.
 * Useful for sending to support or viewing in dev tools.
 */
export function exportLogs(): LogEntry[] {
  return [...logBuffer];
}

/**
 * Clear the log buffer.
 */
export function clearLogs(): void {
  logBuffer.length = 0;
}

/**
 * Get recent logs filtered by category or level.
 */
export function getRecentLogs(options?: {
  category?: LogCategory;
  level?: LogLevel;
  limit?: number;
}): LogEntry[] {
  let logs = [...logBuffer];

  if (options?.category) {
    logs = logs.filter((l) => l.category === options.category);
  }

  if (options?.level) {
    logs = logs.filter((l) => l.level === options.level);
  }

  if (options?.limit) {
    logs = logs.slice(-options.limit);
  }

  return logs;
}
