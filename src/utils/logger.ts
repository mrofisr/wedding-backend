// src/utils/logger.ts
export interface LogEntry {
  timestamp: string;
  method: string;
  path: string;
  status: number;
  responseTime: number;
  userAgent?: string;
  ip?: string;
  requestId: string;
  query?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
  };
}

class Logger {
  private static formatMessage(entry: LogEntry): string {
    const colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      dim: '\x1b[2m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      red: '\x1b[31m',
      gray: '\x1b[90m'
    };

    const statusColor = entry.status >= 500 
      ? colors.red 
      : entry.status >= 400 
        ? colors.yellow 
        : colors.green;

    return [
      `${colors.gray}[${entry.timestamp}]${colors.reset}`,
      `${colors.blue}${entry.method}${colors.reset}`,
      entry.path,
      `${statusColor}${entry.status}${colors.reset}`,
      `${colors.dim}${entry.responseTime}ms${colors.reset}`,
      `${colors.gray}(${entry.requestId})${colors.reset}`
    ].join(' ');
  }

  static log(entry: LogEntry): void {
    // Log main message
    console.log(this.formatMessage(entry));

    // Log additional details
    const details: Record<string, any> = {};
    
    if (entry.userAgent) details.userAgent = entry.userAgent;
    if (entry.ip) details.ip = entry.ip;
    if (Object.keys(entry.query || {}).length > 0) details.query = entry.query;
    if (entry.error) details.error = entry.error;

    if (Object.keys(details).length > 0) {
      console.log('\x1b[2mDetails:\x1b[0m', details);
    }

    // Add separator for errors
    if (entry.status >= 400) {
      console.log('-'.repeat(80));
    }
  }
}

export default Logger;