/**
 * Build Pagefind search index from MDX source (Nextra docs).
 *
 * Next.js 16 prerenders docs as RSC flight data in <script> tags, so the
 * official `pagefind --site .next/server/app` step indexes ~0 doc pages.
 * This script mirrors each docs route as static HTML and runs Pagefind on it.
 *
 * @see https://nextra.site/docs/guide/search
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DOCS_ROOT = path.join(ROOT, 'src', 'app', 'docs')
const SOURCE_DIR = path.join(ROOT, '.pagefind-source')
const OUTPUT_DIR = path.join(ROOT, 'public', '_pagefind')

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function mdxToHtmlBody(source) {
  const lines = source.split('\n')
  const parts = []
  let paragraph = []

  const flushParagraph = () => {
    const text = paragraph.join(' ').trim()
    if (text) parts.push(`<p>${escapeHtml(text)}</p>`)
    paragraph = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('import ') || line.startsWith('export ')) continue
    if (line.startsWith('![') || line.startsWith('<')) continue

    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      flushParagraph()
      const level = heading[1].length
      const text = heading[2]
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      parts.push(`<h${level}>${escapeHtml(text)}</h${level}>`)
      continue
    }

    if (/^[-|]+\s*$/.test(line)) continue
    if (line.startsWith('|')) {
      flushParagraph()
      const cells = line
        .split('|')
        .map((cell) => cell.trim())
        .filter(Boolean)
        .map((cell) => cell.replace(/\*\*([^*]+)\*\*/g, '$1'))
      if (cells.length) parts.push(`<p>${escapeHtml(cells.join(' — '))}</p>`)
      continue
    }

    const text = line
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1 ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1 ')
      .replace(/\*\*([^*]+)\*\*/g, '$1 ')
      .replace(/`([^`]+)`/g, '$1 ')
    paragraph.push(text)
  }

  flushParagraph()
  return parts.join('\n')
}

function collectMdxFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      collectMdxFiles(fullPath, files)
    } else if (entry.name === 'page.mdx') {
      files.push(fullPath)
    }
  }
  return files
}

function routeFromMdxFile(filePath) {
  const relative = path.relative(DOCS_ROOT, filePath).replace(/\\/g, '/')
  const segments = relative.split('/')
  segments.pop()
  return `/docs/${segments.join('/')}`
}

// Docs routes are shaped like /docs/{locale}/..., so the locale is the first
// segment after "docs". Pagefind buckets pages into per-language indexes based
// on the <html lang> attribute, so this must reflect the page's real locale.
function localeFromRoute(route) {
  const segments = route.split('/').filter(Boolean)
  return segments[1] || 'en'
}

function htmlOutputPath(route) {
  const relative = route.replace(/^\//, '')
  const dir = path.dirname(relative)
  const base = path.basename(relative)
  return path.join(SOURCE_DIR, dir, `${base}.html`)
}

function writeHtmlPage(route, source) {
  const titleMatch = source.match(/^#\s+(.+)$/m)
  const title = titleMatch?.[1]?.replace(/\*\*([^*]+)\*\*/g, '$1') ?? 'Documentation'
  const body = mdxToHtmlBody(source)
  const lang = localeFromRoute(route)
  const outPath = htmlOutputPath(route)
  fs.mkdirSync(path.dirname(outPath), { recursive: true })

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
</head>
<body>
  <main data-pagefind-body>
    <h1 data-pagefind-meta="title">${escapeHtml(title)}</h1>
    ${body}
  </main>
</body>
</html>
`

  fs.writeFileSync(outPath, html, 'utf8')
}

function main() {
  if (!fs.existsSync(DOCS_ROOT)) {
    console.error(`Docs directory not found: ${DOCS_ROOT}`)
    process.exit(1)
  }

  fs.rmSync(SOURCE_DIR, { recursive: true, force: true })
  fs.mkdirSync(SOURCE_DIR, { recursive: true })

  const files = collectMdxFiles(DOCS_ROOT)
  for (const file of files) {
    writeHtmlPage(routeFromMdxFile(file), fs.readFileSync(file, 'utf8'))
  }

  console.log(`Generated ${files.length} HTML pages in ${path.relative(ROOT, SOURCE_DIR)}`)

  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true })
  execSync(
    `npx pagefind --site "${SOURCE_DIR}" --output-path "${OUTPUT_DIR}"`,
    { cwd: ROOT, stdio: 'inherit' },
  )

  const entry = JSON.parse(
    fs.readFileSync(path.join(OUTPUT_DIR, 'pagefind-entry.json'), 'utf8'),
  )
  const languages = entry.languages ?? {}
  const pages = Object.values(languages).reduce(
    (sum, lang) => sum + (lang.page_count ?? 0),
    0,
  )
  const perLanguage = Object.entries(languages)
    .map(([code, lang]) => `${code}=${lang.page_count ?? 0}`)
    .join(', ')
  console.log(
    `Pagefind index ready at public/_pagefind (${pages} pages across ${Object.keys(languages).length} languages: ${perLanguage})`,
  )

  if (pages < 10) {
    console.error('Expected many doc pages in the index; check MDX paths.')
    process.exit(1)
  }
}

main()
