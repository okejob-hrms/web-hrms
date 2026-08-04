/**
 * Fail the build if standalone output is missing Nextra docs SSR pieces.
 * Catches the Turbopack regression where /docs layouts + nextra are omitted.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const STANDALONE = path.join(ROOT, '.next', 'standalone');
const SERVER = path.join(STANDALONE, '.next', 'server');

const errors = [];

function exists(p) {
  return fs.existsSync(p);
}

function walkFiles(dir, predicate, acc = []) {
  if (!exists(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, predicate, acc);
    else if (predicate(full)) acc.push(full);
  }
  return acc;
}

if (!exists(STANDALONE)) {
  console.error('verify-docs-standalone: .next/standalone missing (build failed?)');
  process.exit(1);
}

const nextraPkg = path.join(STANDALONE, 'node_modules', 'nextra');
const nextraThemePkg = path.join(STANDALONE, 'node_modules', 'nextra-theme-docs');
if (!exists(nextraPkg)) {
  errors.push('standalone/node_modules/nextra is missing');
}
if (!exists(nextraThemePkg)) {
  errors.push('standalone/node_modules/nextra-theme-docs is missing');
}

const layoutHits = walkFiles(
  SERVER,
  (f) => /docs[/\\](en|id)[/\\]layout\.js$/i.test(f) || /docs.*layout/i.test(path.basename(f)),
);

const chunkDir = path.join(SERVER, 'chunks');
const chunkHits = walkFiles(
  exists(path.join(chunkDir, 'ssr')) ? path.join(chunkDir, 'ssr') : chunkDir,
  (f) => f.endsWith('.js'),
).filter((f) => {
  try {
    const sample = fs.readFileSync(f, 'utf8');
    return (
      sample.includes('getPageMap') ||
      sample.includes('nextra/page-map') ||
      sample.includes('nextra-theme-docs')
    );
  } catch {
    return false;
  }
});

if (layoutHits.length === 0 && chunkHits.length === 0) {
  errors.push(
    'no docs layout module and no SSR chunk referencing getPageMap/nextra (Turbopack standalone bug?)',
  );
}

if (errors.length) {
  console.error('verify-docs-standalone: FAILED');
  for (const e of errors) console.error(`  - ${e}`);
  console.error(
    'Fix: ensure package.json build uses `next build --webpack` (Nextra docs require webpack for production).',
  );
  process.exit(1);
}

console.log('verify-docs-standalone: OK');
if (exists(nextraPkg)) console.log('  - nextra present in standalone');
if (exists(nextraThemePkg)) console.log('  - nextra-theme-docs present in standalone');
if (layoutHits.length) console.log(`  - docs layout files: ${layoutHits.length}`);
if (chunkHits.length) console.log(`  - SSR chunks with nextra/getPageMap: ${chunkHits.length}`);
