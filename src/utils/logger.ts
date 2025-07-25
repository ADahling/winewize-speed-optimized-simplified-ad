type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  source?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];

  private log(level: LogLevel, message: string, data?: any, source?: string) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      source
    };

    // Store logs in memory (could be sent to a service)
    this.logs.push(entry);

    // In development, output to console
    if (this.isDevelopment) {
      const style = this.getConsoleStyle(level);
      console.log(
        `%c[${level.toUpperCase()}] ${message}`,
        style,
        data || ''
      );
    }

    // In production, send to logging service
    if (!this.isDevelopment && level === 'error') {
      // TODO: Send to error tracking service like Sentry
      // this.sendToErrorService(entry);
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    const styles = {
      debug: 'color: #gray',
      info: 'color: #0ea5e9',
      warn: 'color: #f59e0b',
      error: 'color: #ef4444; font-weight: bold'
    };
    return styles[level];
  }

  debug(message: string, data?: any, source?: string) {
    this.log('debug', message, data, source);
  }

  info(message: string, data?: any, source?: string) {
    this.log('info', message, data, source);
  }

  warn(message: string, data?: any, source?: string) {
    this.log('warn', message, data, source);
  }

  error(message: string, data?: any, source?: string) {
    this.log('error', message, data, source);
  }

  // Get recent logs (useful for debugging)
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in components
export type { LogEntry, LogLevel };
