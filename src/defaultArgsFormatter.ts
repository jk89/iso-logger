export const defaultArgsFormatter = (args: unknown[]): string => {
  return args
    .map((arg) => {
      if (typeof arg === 'bigint') return `${arg.toString()}n`;
      if (arg === undefined) return 'undefined';
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg);
        } catch {
          return '[Circular]';
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return String(arg);
    })
    .join(' ');
};
