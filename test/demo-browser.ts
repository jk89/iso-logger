import puppeteer from 'puppeteer';
import { createServer, Server } from 'http';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as esbuild from 'esbuild';

const PORT = 3456;

const buildBundle = async (): Promise<string> => {
  const result = await esbuild.build({
    entryPoints: ['src/index.browser.ts'],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    write: false,
    sourcemap: 'inline',
  });
  return result.outputFiles[0]!.text;
};

const startServer = (): Promise<Server> => {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const url = req.url ?? '/';

      if (url === '/') {
        res.writeHead(302, { Location: '/test/demo-browser.html' });
        res.end();
        return;
      }

      if (url === '/favicon.ico') {
        res.writeHead(204);
        res.end();
        return;
      }

      if (url === '/bundle.js') {
        const bundledJs = await buildBundle();
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(bundledJs);
        return;
      }

      const filePath = join(process.cwd(), url);
      try {
        const content = readFileSync(filePath);
        const ext = url.split('.').pop();
        const contentType =
          ext === 'html'
            ? 'text/html'
            : ext === 'js'
              ? 'application/javascript'
              : 'text/plain';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      } catch {
        res.writeHead(404);
        res.end('Not found: ' + filePath);
      }
    });

    server.listen(PORT, () => resolve(server));
  });
};

const main = async () => {
  console.log('Starting server...');
  const server = await startServer();
  console.log(`Server running at http://localhost:${PORT}/`);

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--auto-open-devtools-for-tabs'],
  });

  const page = await browser.newPage();

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[Browser ${type}] ${text}`);
  });

  await page.goto(`http://localhost:${PORT}/test/demo-browser.html`, { waitUntil: 'domcontentloaded' });

  console.log('\n=== Browser demo launched ===');
  console.log('Check the browser DevTools console to see the colored output.');
  console.log('Close the browser or press Ctrl+C to exit.\n');

  const cleanup = () => {
    server.close();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  browser.on('disconnected', cleanup);
};

main().catch(console.error);
