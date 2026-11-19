/** Log level type. */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CURRENT_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) ?? 'info';

/**
 * Format a log message with a timestamp and level prefix.
 */
const format = (level: LogLevel, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
};

/**
 * Simple console logger with configurable levels.
 */
export const logger = {
  /**
   * Log a debug message.
   * @param message - The message to log
   * @param args - Additional arguments
   */
  debug(message: string, ...args: unknown[]): void {
    if (LOG_LEVELS[CURRENT_LEVEL] <= LOG_LEVELS.debug) {
      console.debug(format('debug', message), ...args);
    }
  },

  /**
   * Log an informational message.
   * @param message - The message to log
   * @param args - Additional arguments
   */
  info(message: string, ...args: unknown[]): void {
    if (LOG_LEVELS[CURRENT_LEVEL] <= LOG_LEVELS.info) {
      console.info(format('info', message), ...args);
    }
  },

  /**
   * Log a warning message.
   * @param message - The message to log
   * @param args - Additional arguments
   */
  warn(message: string, ...args: unknown[]): void {
    if (LOG_LEVELS[CURRENT_LEVEL] <= LOG_LEVELS.warn) {
      console.warn(format('warn', message), ...args);
    }
  },

  /**
   * Log an error message.
   * @param message - The message to log
   * @param args - Additional arguments
   */
  error(message: string, ...args: unknown[]): void {
    if (LOG_LEVELS[CURRENT_LEVEL] <= LOG_LEVELS.error) {
      console.error(format('error', message), ...args);
    }
  },
};
