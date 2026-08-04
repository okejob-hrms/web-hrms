/**
 * Copy Nextra theme runtime packages into `.next/standalone/node_modules`.
 * Next file tracing often includes `nextra-theme-docs` but not its transitive
 * deps; Docker has no parent node_modules, so Layout SSR then digests.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC_NM = path.join(ROOT, 'node_modules');
const DEST_NM = path.join(ROOT, '.next', 'standalone', 'node_modules');

/** Top-level packages that must resolve at standalone runtime. */
const ROOT_PACKAGES = [
  'nextra',
  'nextra-theme-docs',
  'next-themes',
  'zod',
  'clsx',
  'zustand',
  'react-compiler-runtime',
  '@headlessui/react',
  'scroll-into-view-if-needed',
  'compute-scroll-into-view',
  '@floating-ui/react',
  '@floating-ui/react-dom',
  '@floating-ui/dom',
  '@floating-ui/core',
  '@floating-ui/utils',
  '@react-aria/focus',
  '@react-aria/interactions',
  '@react-aria/utils',
  '@react-aria/ssr',
  '@react-stately/utils',
  '@react-types/shared',
  '@tanstack/react-virtual',
  '@tanstack/virtual-core',
  'use-sync-external-store',
  'tabbable',
];

function exists(p) {
  return fs.existsSync(p);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function packageDir(pkg) {
  return path.join(SRC_NM, ...pkg.split('/'));
}

function destPackageDir(pkg) {
  return path.join(DEST_NM, ...pkg.split('/'));
}

function readDeps(pkgDir) {
  const pj = path.join(pkgDir, 'package.json');
  if (!exists(pj)) return [];
  try {
    const json = JSON.parse(fs.readFileSync(pj, 'utf8'));
    return Object.keys(json.dependencies || {});
  } catch {
    return [];
  }
}

if (!exists(path.join(ROOT, '.next', 'standalone'))) {
  console.error('copy-nextra-standalone-deps: .next/standalone missing');
  process.exit(1);
}

fs.mkdirSync(DEST_NM, { recursive: true });

const queue = [...ROOT_PACKAGES];
const seen = new Set();
const copied = [];
const missing = [];

while (queue.length) {
  const pkg = queue.shift();
  if (!pkg || seen.has(pkg)) continue;
  seen.add(pkg);

  // Skip next/react — already in standalone
  if (
    pkg === 'react' ||
    pkg === 'react-dom' ||
    pkg === 'next' ||
    pkg.startsWith('next/')
  ) {
    continue;
  }

  const src = packageDir(pkg);
  if (!exists(src)) {
    // Optional / nested-only packages — warn but continue for non-roots
    if (ROOT_PACKAGES.includes(pkg)) missing.push(pkg);
    continue;
  }

  const dest = destPackageDir(pkg);
  copyDir(src, dest);
  copied.push(pkg);

  for (const dep of readDeps(src)) {
    if (!seen.has(dep)) queue.push(dep);
  }
}

console.log(
  `copy-nextra-standalone-deps: copied ${copied.length} packages into standalone`,
);
if (missing.length) {
  console.error('copy-nextra-standalone-deps: missing required packages:');
  for (const m of missing) console.error(`  - ${m}`);
  process.exit(1);
}
