import type { LogLevel, NonEmptyString } from './Logger.js';
import type { Palette } from './Palette.js';

export interface ILogPrinter {
  enable(level: LogLevel): void;
  disable(level: LogLevel): void;
}

export interface LogPrinterOptions<H extends string> {
  header: NonEmptyString<H>;
  enabledLevels?: LogLevel[];
  palette?: Palette;
  argsFormatter?: (args: unknown[]) => string;
}
