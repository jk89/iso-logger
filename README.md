# esm-iso-logger

A zero-dependency, isomorphic logger that looks great in Node.js, browsers, VS Code, GitHub Actions, Deno, Bun… and anywhere else JavaScript runs. Universal logging core. One event emitter, one logger class, zero deps. Bolt on any backend by subscribing to the same single event. Tree-shakeable ESM only, no CommonJS.

Ships with pretty console printers for node (ansi) and browser (css):

| Feature                                         | Node.js | Browser |
| ----------------------------------------------- | ------- | ------- |
| **True-color** ANSI (256 / 24-bit)              | X       | —       |
| **CSS-styled** console output                   | —       | X       |
| **Automatic** environment detection             | X       | X       |
| **Toggle** log-levels at runtime                | X       | X       |
| **Tree-shakeable** ESM only                     | X       | X       |
| **Extendable** define your own backends         | X       | X       |

----------------------------------

## Installation

`npm i esm-iso-logger`

----------------------------------

## Api surface

```typescript
import {
  Logger,                 // Create named loggers
  LogLevel,               // Union type: 'log'|'info'|'warn'|'error'|'debug'|'verbose'|'fatal'
  LogMessage,             // Shape of each log event
  loggingEventEmitter,    // Shared EventEmitter – subscribe to 'log' to build custom backends

  LogPrinter,             // Ready-made console backend (auto-picks Node ANSI or Browser CSS)
  ILogPrinter,            // Interface if you want to write your own printer
  LogPrinterOptions,      // Constructor options bag for LogPrinter

  Colour,                 // Colour builder: Colour.rgb(r,g,b).bold.italic …
  Palette,                // Palette interface map used by LogPrinter
  defaultPalette,         // Default colours (light-ish)
  defaultPalette2,        // Darker alternative palette

  defaultArgsFormatter    // turns args[] -> single string (used by LogPrinter, reusable)
} from 'esm-iso-logger';
```

### Logger:
```typescript
  new Logger(context: string)
  logger.log|info|warn|error|debug|verbose|fatal(...args: unknown[])
```

### LogMessage shape:
```typescript
  interface LogMessage {
    level: 'log'|'info'|'warn'|'error'|'debug'|'verbose'|'fatal';
    args: unknown[];
    context: string;
    timestamp: string; // ISO
  }
```

### LogPrinter (optional):
```typescript
  const printer = new LogPrinter<H extends string>(
    header: H,
    levels?: LogLevel[],           // Log levels (default: ['log', 'info', 'error', 'warn', 'debug', 'verbose', 'fatal'])
    palette?: Palette,             // RGB + styles (default: defaultPalette)
    formatter?: (args[]) => string // Formatter (default: defaultArgsFormatter)
  )
```

### Runtime toggle:
```typescript
  printer.disable('debug');
  printer.enable('debug');
```

### Multiple printers / backends are possible:

```typescript
new LogPrinter('Prod', ['error', 'fatal']); // console only errors
new LogPrinter('Dev');                      // console everything
```

### Environment quirks:

```
NO_COLOR=1 or FORCE_COLOR=0  -> plain text
FORCE_COLOR=3                -> full 24-bit ANSI
VS Code / GitHub Actions     -> auto-detected true-color
Browser                      -> falls back to unstyled if console lacks %c
```

----------------------------------

## Quickstart

```typescript
import { LogPrinter } from 'esm-iso-logger';

// 2. spin it up (can have many)
new LogPrinter('MyApp');

// 3. create contextual loggers
import { Logger } from 'esm-iso-logger';
const logger = new Logger('UserService');

logger.info('Server listening on port', 3000);
```

```
[MyApp] 2026-01-21T17:04:12.345Z    INFO [UserService] Server listening on port 3000
```

----------------------------------

## Bring your own backend

The core only emits; it never cares who listens.

```typescript
import { loggingEventEmitter, type LogMessage } from 'esm-iso-logger';

// plain function
loggingEventEmitter.on('log', (msg: LogMessage) => {
  fetch('https://grafana.example.com/loki/api/v1/push', {
    method: 'POST',
    body: JSON.stringify(msg)
  });
});
```

Wrap it in a class if you want:

```typescript
class FileSink {
  constructor(private path: string) {
    loggingEventEmitter.on('log', m => this.append(m));
  }
  private append(m: LogMessage) {
    require('node:fs').appendFileSync(this.path, JSON.stringify(m) + '\n');
  }
}
new FileSink('./app.jsonl');
```

You can run any number of backends side-by-side; each receives every LogMessage and decides what to do with it.

## Test commands

```bash
npm run demo:node:default          # default colour detection
npm run demo:node:force3           # force 24-bit RGB
npm run demo:node:force0           # force off (plain)
npm run demo:node:nocolor          # respect NO_COLOR=1
npm run demo:node:vscode           # VS Code terminal
npm run demo:node:github           # GitHub Actions
npm run demo:node:gitea            # Gitea Actions
npm run demo:node:xterm256         # 256-colour palette
npm run demo:browser               # opens headless Chrome demo
```

## License:
**MIT 2026**