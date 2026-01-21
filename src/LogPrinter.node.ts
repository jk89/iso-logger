import { defaultArgsFormatter } from './defaultArgsFormatter.js';
import {
  type LogLevel,
  type LogMessage,
  type NonEmptyString,
  loggingEventEmitter,
} from './Logger.js';
import { type ILogPrinter } from './LogPrinter.js';
import { type Colour, type Palette, defaultPalette } from './Palette.js';

const RESET = '\x1b[0m';

const getColorLevel = (): 0 | 1 | 2 | 3 => {
  // Forced color level
  if (process.env['FORCE_COLOR'] === '3') return 3;
  if (process.env['FORCE_COLOR'] === '2') return 2;
  if (process.env['FORCE_COLOR'] === '1') return 1;
  if (process.env['FORCE_COLOR'] === '0' || process.env['NO_COLOR']) return 0;

  // No TTY = no color
  if (!process.stdout.isTTY) return 0;

  // Level 3: TrueColor
  if (
    process.env['COLORTERM'] === 'truecolor' ||
    process.env['TERM_PROGRAM'] === 'vscode' ||
    process.env['GITHUB_ACTIONS'] === 'true' ||
    process.env['GITEA_ACTIONS'] === 'true'
  ) {
    return 3;
  }

  // Level 2: 256-color
  if ((process.env['TERM'] ?? '').startsWith('xterm-256color')) return 2;

  // Level 1: 16-color
  if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env['TERM'] ?? '')) return 1;

  // Default to basic color if TTY
  return 1;
};

const rgbToAnsi256 = (r: number, g: number, b: number): number => {
  // Grayscale
  if (r === g && g === b) {
    if (r < 8) return 16;
    if (r > 248) return 231;
    return Math.round(((r - 8) / 247) * 24) + 232;
  }
  // Color cube
  return (
    16 + 36 * Math.round((r / 255) * 5) + 6 * Math.round((g / 255) * 5) + Math.round((b / 255) * 5)
  );
};

const ansi256ToAnsi16 = (code: number): number => {
  if (code < 8) return 30 + code;
  if (code < 16) return 90 + (code - 8);

  // For 256 colors, map to closest 16 color
  let r: number, g: number, b: number;
  if (code >= 232) {
    // Grayscale
    const gray = (code - 232) * 10 + 8;
    r = g = b = gray;
  } else {
    // Color cube
    const c = code - 16;
    r = Math.floor(c / 36) * 51;
    g = Math.floor((c % 36) / 6) * 51;
    b = (c % 6) * 51;
  }

  const value = Math.max(r, g, b);
  if (value < 50) return 30; // black

  let ansi = 30;
  if (b >= 128) ansi += 4;
  if (g >= 128) ansi += 2;
  if (r >= 128) ansi += 1;

  if (value >= 192) ansi += 60; // bright

  return ansi;
};

const toAnsi = (colour: Colour, level: 0 | 1 | 2 | 3, isBg = false): string => {
  if (level === 0) return '';

  const r = colour.redValue;
  const g = colour.greenValue;
  const b = colour.blueValue;
  const bgOffset = isBg ? 10 : 0;

  let code = '';

  if (level === 3) {
    code = isBg
      ? `\x1b[48;2;${r.toString()};${g.toString()};${b.toString()}m`
      : `\x1b[38;2;${r.toString()};${g.toString()};${b.toString()}m`;
  } else if (level === 2) {
    const ansi256 = rgbToAnsi256(r, g, b);
    code = isBg ? `\x1b[48;5;${ansi256.toString()}m` : `\x1b[38;5;${ansi256.toString()}m`;
  } else {
    const ansi16 = ansi256ToAnsi16(rgbToAnsi256(r, g, b));
    code = `\x1b[${(ansi16 + bgOffset).toString()}m`;
  }

  // Add modifiers
  if (colour.boldValue) code += '\x1b[1m';
  if (colour.dimValue) code += '\x1b[2m';
  if (colour.italicValue) code += '\x1b[3m';
  if (colour.underlineValue) code += '\x1b[4m';
  if (colour.inverseValue) code += '\x1b[7m';
  if (colour.hiddenValue) code += '\x1b[8m';
  if (colour.strikethroughValue) code += '\x1b[9m';

  return code;
};

const COLOR_LEVEL = getColorLevel();

export class LogPrinter<H extends string> implements ILogPrinter {
  #enabledLevels: Set<LogLevel>;
  #palette: Palette;
  #argsFormatter: (args: unknown[]) => string;

  constructor(
    private header: NonEmptyString<H>,
    enabledLevels: LogLevel[] = ['log', 'info', 'error', 'warn', 'debug', 'verbose', 'fatal'],
    palette: Palette = defaultPalette,
    argsFormatter: (args: unknown[]) => string = defaultArgsFormatter
  ) {
    this.#enabledLevels = new Set(enabledLevels);
    this.#palette = palette;
    this.#argsFormatter = argsFormatter;

    loggingEventEmitter.on('log', (data) => {
      this.handleLog(data);
    });
  }

  private handleLog({ level, args, context, timestamp }: LogMessage) {
    if (!this.#enabledLevels.has(level)) return;

    const levelColour = this.#palette[level];
    const bg = this.#palette.background;

    const headerCode = toAnsi(this.#palette.header, COLOR_LEVEL);
    const timeCode = toAnsi(this.#palette.time, COLOR_LEVEL);
    const levelCode = toAnsi(levelColour, COLOR_LEVEL);
    const contextCode = toAnsi(this.#palette.context, COLOR_LEVEL);
    const bgCode = bg ? toAnsi(bg, COLOR_LEVEL, true) : '';

    const formattedLevel = level.toUpperCase().padStart(7);
    const formattedMsg = this.#argsFormatter(args);

    const output =
      `${bgCode}${headerCode}[${this.header}]${RESET} ` +
      `${bgCode}${timeCode}${timestamp}${RESET} ` +
      `${bgCode}${levelCode}${formattedLevel}${RESET} ` +
      `${bgCode}${contextCode}[${context}]${RESET} ` +
      `${bgCode}${levelCode}${formattedMsg}${RESET}`;

    switch (level) {
      case 'error':
      case 'fatal':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'info':
        console.info(output);
        break;
      case 'debug':
      case 'verbose':
        console.debug(output);
        break;
      case 'log':
        console.log(output);
        break;
    }
  }

  enable(level: LogLevel) {
    this.#enabledLevels.add(level);
  }

  disable(level: LogLevel) {
    this.#enabledLevels.delete(level);
  }
}
