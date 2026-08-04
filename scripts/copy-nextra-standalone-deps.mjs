/**
 * Copy Nextra theme runtime packages into `.next/standalone/node_modules`.
 * Next file tracing often includes `nextra-theme-docs` but not its transitive
 * deps; Docker has no parent node_modules, so Layout SSR then digests.
 *
 * Bun/npm hoist layouts differ — prefer copying whole scopes (@react-aria, etc.)
 * and resolve individual packages via createRequire when possible.
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC_NM = path.join(ROOT, 'node_modules');
const DEST_NM = path.join(ROOT, '.next', 'standalone', 'node_modules');
const requireFromRoot = createRequire(path.join(ROOT, 'package.json'));

/** Must be present somehow (top-level or resolvable). */
const REQUIRED_PACKAGES = [
  'nextra',
  'nextra-theme-docs',
  'next-themes',
  'zod',
  'clsx',
  'zustand',
  'react-compiler-runtime',
  '@headlessui/react',
  '@floating-ui/react',
  '@tanstack/react-virtual',
];

/** Extra packages to pull when resolvable (best-effort). */
const EXTRA_PACKAGES = [
  'scroll-into-view-if-needed',
  'compute-scroll-into-view',
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
  '@tanstack/virtual-core',
  'use-sync-external-store',
  'tabbable',
];

/** Copy entire scopes — covers bun nested/hoist differences. */
const SCOPES = [
  '@headlessui',
  '@floating-ui',
  '@react-aria',
  '@react-stately',
  '@react-types',
  '@tanstack',
];

function exists(p) {
  return fs.existsSync(p);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isSymbolicLink()) {
      // Materialize symlink targets so standalone stays self-contained
      const real = fs.realpathSync(from);
      if (fs.statSync(real).isDirectory()) copyDir(real, to);
      else {
        fs.mkdirSync(path.dirname(to), { recursive: true });
        fs.copyFileSync(real, to);
      }
      continue;
    }
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function resolvePackageDir(pkg) {
  try {
    return path.dirname(requireFromRoot.resolve(`${pkg}/package.json`));
  } catch {
    // ignore
  }

  const direct = path.join(SRC_NM, ...pkg.split('/'));
  if (exists(path.join(direct, 'package.json'))) return direct;

  // Search one level of nesting under scopes (bun sometimes nests)
  for (const scope of SCOPES) {
    const scopeDir = path.join(SRC_NM, scope);
    if (!exists(scopeDir)) continue;
    for (const child of fs.readdirSync(scopeDir, { withFileTypes: true })) {
      if (!child.isDirectory()) continue;
      const nested = path.join(scopeDir, child.name, 'node_modules', ...pkg.split('/'));
      if (exists(path.join(nested, 'package.json'))) return nested;
    }
  }

  return null;
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

// 1) Copy whole scopes first
for (const scope of SCOPES) {
  const src = path.join(SRC_NM, scope);
  if (!exists(src)) {
    console.warn(`copy-nextra-standalone-deps: scope missing ${scope}`);
    continue;
  }
  copyDir(src, path.join(DEST_NM, scope));
  console.log(`copy-nextra-standalone-deps: copied scope ${scope}`);
}

// 2) Copy / hoist individual packages + transitive deps
const queue = [...REQUIRED_PACKAGES, ...EXTRA_PACKAGES];
const seen = new Set();
const copied = [];
const missingRequired = [];

while (queue.length) {
  const pkg = queue.shift();
  if (!pkg || seen.has(pkg)) continue;
  seen.add(pkg);

  if (
    pkg === 'react' ||
    pkg === 'react-dom' ||
    pkg === 'next' ||
    pkg.startsWith('next/')
  ) {
    continue;
  }

  const src = resolvePackageDir(pkg);
  if (!src) {
    if (REQUIRED_PACKAGES.includes(pkg)) missingRequired.push(pkg);
    else console.warn(`copy-nextra-standalone-deps: skip unresolved ${pkg}`);
    continue;
  }

  const dest = destPackageDir(pkg);
  if (!exists(dest)) {
    copyDir(src, dest);
    copied.push(pkg);
  }

  for (const dep of readDeps(src)) {
    if (!seen.has(dep)) queue.push(dep);
  }
}

console.log(
  `copy-nextra-standalone-deps: copied/ensured ${copied.length} individual packages`,
);

if (missingRequired.length) {
  console.error('copy-nextra-standalone-deps: missing required packages:');
  for (const m of missingRequired) console.error(`  - ${m}`);
  process.exit(1);
}

// Soft-check scopes that headless needs
for (const pkg of [
  '@floating-ui/react',
  '@react-aria/focus',
  '@tanstack/react-virtual',
]) {
  if (!exists(destPackageDir(pkg)) && !resolvePackageDir(pkg)) {
    console.warn(
      `copy-nextra-standalone-deps: warning — ${pkg} not in standalone after copy`,
    );
  }
}

console.log('copy-nextra-standalone-deps: OK');
