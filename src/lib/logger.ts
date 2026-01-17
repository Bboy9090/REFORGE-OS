/**
 * Centralized Logging System
 * Structured logging for debugging, errors, and performance monitoring
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: Record<string, unknown>;
  stack?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogSize = 1000;
  private level: LogLevel = LogLevel.INFO;
  private enableConsole = true;
  private enableServer = false;

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Enable/disable console logging
   */
  setConsoleEnabled(enabled: boolean): void {
    this.enableConsole = enabled;
  }

  /**
   * Enable/disable server logging
   */
  setServerEnabled(enabled: boolean): void {
    this.enableServer = enabled;
  }

  /**
   * Log a message
   */
  private log(
    level: LogLevel,
    category: string,
    message: string,
    data?: Record<string, unknown>,
    error?: Error
  ): void {
    if (level < this.level) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      stack: error?.stack,
    };

    // Add to log buffer
    this.logs.push(entry);
    if (this.logs.length > this.maxLogSize) {
      this.logs.shift();
    }

    // Console logging
    if (this.enableConsole) {
      const levelName = LogLevel[level];
      const prefix = `[${entry.timestamp}] [${levelName}] [${category}]`;
      const args: unknown[] = [prefix, message];
      if (data) args.push(data);
      if (error) args.push(error);

      switch (level) {
        case LogLevel.DEBUG:
          console.debug(...args);
          break;
        case LogLevel.INFO:
          console.info(...args);
          break;
        case LogLevel.WARN:
          console.warn(...args);
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(...args);
          break;
      }
    }

    // Server logging (future implementation)
    if (this.enableServer) {
      this.sendToServer(entry);
    }
  }

  /**
   * Debug log
   */
  debug(category: string, message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  /**
   * Info log
   */
  info(category: string, message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  /**
   * Warn log
   */
  warn(category: string, message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  /**
   * Error log
   */
  error(
    category: string,
    message: string,
    error?: Error | unknown,
    data?: Record<string, unknown>
  ): void {
    const err = error instanceof Error ? error : undefined;
    this.log(LogLevel.ERROR, category, message, data, err);
  }

  /**
   * Fatal log
   */
  fatal(
    category: string,
    message: string,
    error?: Error | unknown,
    data?: Record<string, unknown>
  ): void {
    const err = error instanceof Error ? error : undefined;
    this.log(LogLevel.FATAL, category, message, data, err);
  }

  /**
   * Get logs
   */
  getLogs(level?: LogLevel, category?: string): LogEntry[] {
    let filtered = [...this.logs];
    if (level !== undefined) {
      filtered = filtered.filter(log => log.level >= level);
    }
    if (category) {
      filtered = filtered.filter(log => log.category === category);
    }
    return filtered;
  }

  /**
   * Clear logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Send log to server (future implementation)
   */
  private async sendToServer(entry: LogEntry): Promise<void> {
    // TODO: Implement server-side logging
    try {
      // Example: await fetch('/api/v1/logs', { method: 'POST', body: JSON.stringify(entry) });
    } catch {
      // Fail silently - don't let logging cause errors
    }
  }

  /**
   * Performance logging
   */
  performance(label: string, startTime: number, data?: Record<string, unknown>): void {
    const duration = performance.now() - startTime;
    this.debug('PERFORMANCE', `${label}: ${duration.toFixed(2)}ms`, { ...data, duration });
  }

  /**
   * API request logging
   */
  apiRequest(
    method: string,
    endpoint: string,
    status: number,
    duration: number,
    error?: Error
  ): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.DEBUG;
    this.log(
      level,
      'API',
      `${method} ${endpoint} - ${status} (${duration.toFixed(2)}ms)`,
      { method, endpoint, status, duration },
      error
    );
  }
}

// Export singleton instance
export const logger = new Logger();

// In development, show all logs. In production, only warnings and errors
if (import.meta.env.DEV) {
  logger.setLevel(LogLevel.DEBUG);
} else {
  logger.setLevel(LogLevel.WARN);
}
