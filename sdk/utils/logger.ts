/**
 * Logger Utility
 * Simple logging utility for MCP SDK
 */

export interface Logger {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  debug(...args: any[]): void;
}

export function createLogger(context: string, subcontext?: string): Logger {
  const prefix = subcontext ? `[${context}:${subcontext}]` : `[${context}]`;

  return {
    log(...args: any[]): void {
      console.log(prefix, ...args);
    },

    error(...args: any[]): void {
      console.error(prefix, ...args);
    },

    warn(...args: any[]): void {
      console.warn(prefix, ...args);
    },

    debug(...args: any[]): void {
      console.debug(prefix, ...args);
    },
  };
}
