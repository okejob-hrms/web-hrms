import { getPageMap } from 'nextra/page-map';
import type { PageMapItem } from 'nextra';
import 'nextra-theme-docs/style.css';
import { DocsNextraShell } from '@/components/docs/docs-nextra-shell';

async function loadDocsPageMap(locale: 'en' | 'id'): Promise<PageMapItem[]> {
  const candidates = [`/docs/${locale}`, `/${locale}`, '/docs', '/'];
  let lastError: unknown;

  for (const route of candidates) {
    try {
      const pageMap = await getPageMap(route);
      console.info(
        `[docs/${locale}] getPageMap(${route}) ok items=${pageMap?.length ?? 0}`,
      );
      return pageMap;
    } catch (error) {
      lastError = error;
      console.error(`[docs/${locale}] getPageMap(${route}) failed`, error);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`[docs/${locale}] getPageMap failed for all candidates`);
}

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pageMap = await loadDocsPageMap('en');
  return <DocsNextraShell pageMap={pageMap}>{children}</DocsNextraShell>;
}
