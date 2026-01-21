import { Logger, LogPrinter } from '../dist/index.node.js';

const printer = new LogPrinter('MyApp');
const logger = new Logger('DemoContext');

console.log('\n=== Node.js Logger Demo ===\n');

logger.log('This is a log message');
logger.info('This is an info message');
logger.warn('This is a warning message');
logger.error('This is an error message');
logger.debug('This is a debug message');
logger.verbose('This is a verbose message');
logger.fatal('This is a fatal message');

console.log('\n=== With Objects ===\n');

logger.log('User data:', { name: 'John', age: 30, active: true });
logger.info('Config:', { debug: false, version: '1.0.0' });

console.log('\n=== Multiple Args ===\n');

logger.log('Multiple', 'arguments', 'here', 123, true);
logger.info('BigInt:', 9007199254740991n);

console.log('\n=== Done ===\n');
