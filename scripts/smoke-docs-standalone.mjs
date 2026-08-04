/**
 * Smoke-test /docs routes against the standalone server (same runtime as Docker).
 * Run after build: npm run build && npm run smoke:docs
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const STANDALONE_DIR = path.join(ROOT, '.next', 'standalone');
const PORT = Number(process.env.SMOKE_PORT ?? 3099);
const ROUTES = ['/docs/en', '/docs/id', '/docs/en/manual/start-here'];

function findServerJs(dir) {
  if (!fs.existsSync(dir)) return null;
  const direct = path.join(dir, 'server.js');
  if (fs.existsSync(direct)) return direct;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const found = findServerJs(path.join(dir, entry.name));
    if (found) return found;
  }
  return null;
}

function waitForServer(url, timeoutMs = 30_000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Server did not become ready within ${timeoutMs}ms`));
          return;
        }
        setTimeout(tick, 300);
      });
    };
    tick();
  });
}

function fetchText(route) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${PORT}${route}`, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode ?? 0, body });
      });
    });
    req.on('error', reject);
  });
}

const serverJs = findServerJs(STANDALONE_DIR);
if (!serverJs) {
  console.error('No standalone server.js found. Run `npm run build` first.');
  process.exit(1);
}

const serverCwd = path.dirname(serverJs);
console.log(`Starting standalone server: ${serverJs}`);

const child = spawn(process.execPath, [serverJs], {
  cwd: serverCwd,
  env: { ...process.env, PORT: String(PORT), HOSTNAME: '127.0.0.1' },
  stdio: ['ignore', 'pipe', 'pipe'],
});

child.stdout?.on('data', (chunk) => process.stdout.write(chunk));
child.stderr?.on('data', (chunk) => process.stderr.write(chunk));

let failed = false;

try {
  await waitForServer(`http://127.0.0.1:${PORT}/`);

  for (const route of ROUTES) {
    const { status, body } = await fetchText(route);
    const hasAppError = body.includes('Application error');
    const digest =
      body.match(/"digest":"(\d+)"/)?.[1] ??
      body.match(/Digest:\s*(\d+)/)?.[1];
    const ok = status === 200 && !hasAppError && !digest;

    if (ok) {
      console.log(`OK  ${route} (${status})`);
    } else {
      failed = true;
      console.error(
        `FAIL ${route} (status=${status}, applicationError=${hasAppError}, digest=${digest ?? 'none'})`,
      );
    }
  }
} catch (err) {
  failed = true;
  console.error('Smoke test error:', err);
} finally {
  child.kill();
}

process.exit(failed ? 1 : 0);
