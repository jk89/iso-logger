import { EventEmitter } from 'esm-iso-logger/events';

export type LogLevel = 'log' | 'info' | 'error' | 'warn' | 'debug' | 'verbose' | 'fatal';

export type NonEmptyString<S extends string> = S extends '' ? never : S;

export interface LogMessage<C extends string = string> {
  level: LogLevel;
  args: unknown[];
  context: NonEmptyString<C>;
  timestamp: string;
}

interface LoggingEvents {
  log: [LogMessage];
}

export interface LoggingEventEmitter {
  on<K extends keyof LoggingEvents>(event: K, listener: (...args: LoggingEvents[K]) => void): this;
  emit<K extends keyof LoggingEvents>(event: K, ...args: LoggingEvents[K]): boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
export const loggingEventEmitter: LoggingEventEmitter = new EventEmitter();

export class Logger<C extends string = string> {
  constructor(private context: NonEmptyString<C>) {}

  private emitLog(level: LogLevel, args: unknown[]) {
    const log: LogMessage = {
      level,
      args,
      context: this.context,
      timestamp: new Date().toISOString(),
    };
    loggingEventEmitter.emit('log', log);
  }

  log(...args: unknown[]) {
    this.emitLog('log', args);
  }

  info(...args: unknown[]) {
    this.emitLog('info', args);
  }

  warn(...args: unknown[]) {
    this.emitLog('warn', args);
  }

  debug(...args: unknown[]) {
    this.emitLog('debug', args);
  }

  verbose(...args: unknown[]) {
    this.emitLog('verbose', args);
  }

  fatal(...args: unknown[]) {
    this.emitLog('fatal', args);
  }

  error(...args: unknown[]) {
    this.emitLog('error', args);
  }
}
