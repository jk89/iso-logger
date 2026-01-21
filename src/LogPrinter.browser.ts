import { defaultArgsFormatter } from './defaultArgsFormatter.js';
import {
  type LogLevel,
  type LogMessage,
  type NonEmptyString,
  loggingEventEmitter,
} from './Logger.js';
import { type ILogPrinter } from './LogPrinter.js';
import { type Colour, type Palette, defaultPalette } from './Palette.js';

const toCss = (colour: Colour, background?: Colour): string => {
  let css = `color: rgb(${colour.redValue.toString()}, ${colour.greenValue.toString()}, ${colour.blueValue.toString()});`;
  if (background) {
    css += ` background-color: rgb(${background.redValue.toString()}, ${background.greenValue.toString()}, ${background.blueValue.toString()});`;
  }
  if (colour.boldValue) css += ' font-weight: bold;';
  if (colour.italicValue) css += ' font-style: italic;';
  if (colour.underlineValue) css += ' text-decoration: underline;';
  if (colour.strikethroughValue) css += ' text-decoration: line-through;';
  if (colour.dimValue) css += ' opacity: 0.5;';
  return css;
};

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
    const headerStyle = toCss(this.#palette.header, bg);
    const timeStyle = toCss(this.#palette.time, bg);
    const levelStyle = toCss(levelColour, bg);
    const contextStyle = toCss(this.#palette.context, bg);
    const msgStyle = toCss(levelColour, bg);

    const formattedLevel = level.toUpperCase().padStart(7);
    const formattedMsg = this.#argsFormatter(args);

    const format = `%c[${this.header}] %c${timestamp} %c${formattedLevel} %c[${context}] %c${formattedMsg}`;
    const styles = [headerStyle, timeStyle, levelStyle, contextStyle, msgStyle];

    switch (level) {
      // The icons break how the log alignment, the colours are enough
      /*case 'error':
      case 'fatal':
        console.error(format, ...styles);
        break;
      case 'warn':
        console.warn(format, ...styles);
        break;*/
      default:
        console.log(format, ...styles);
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
