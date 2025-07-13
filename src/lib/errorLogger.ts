/**
 * Centralized error logging utility
 * Provides structured error logging with context information
 */

interface ErrorContext {
  [key: string]: any;
}

interface ErrorLogEntry {
  timestamp: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  level: 'error' | 'warn' | 'info';
  userAgent?: string;
  url?: string;
}

/**
 * Log error with structured context information
 * @param error - The error object to log
 * @param context - Additional context information
 * @param level - Log level (default: 'error')
 */
export function logError(
  error: Error, 
  context: ErrorContext = {}, 
  level: 'error' | 'warn' | 'info' = 'error'
): void {
  const errorEntry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    context,
    level,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };

  // Log to console with proper formatting
  const logMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info;
  const emoji = level === 'error' ? '🚨' : level === 'warn' ? '⚠️' : 'ℹ️';
  
  console.group(`${emoji} ${level.charAt(0).toUpperCase() + level.slice(1)} Log [${level.toUpperCase()}]`);
  logMethod('Message:', errorEntry.message);
  logMethod('Timestamp:', errorEntry.timestamp);
  if (errorEntry.stack) {
    logMethod('Stack:', errorEntry.stack);
  }
  if (Object.keys(context).length > 0) {
    logMethod('Context:', context);
  }
  console.groupEnd();

  // In production, you might want to send this to an external logging service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implement external logging service integration
    // Example: send to Sentry, LogRocket, etc.
  }
}

/**
 * Log warning with context
 * @param message - Warning message
 * @param context - Additional context information
 */
export function logWarning(message: string, context: ErrorContext = {}): void {
  const warningError = new Error(message);
  logError(warningError, context, 'warn');
}

/**
 * Log info with context
 * @param message - Info message
 * @param context - Additional context information
 */
export function logInfo(message: string, context: ErrorContext = {}): void {
  const infoError = new Error(message);
  logError(infoError, context, 'info');
}