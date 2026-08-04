import { Layout, Navbar, Footer } from 'nextra-theme-docs';
import { getPageMap } from 'nextra/page-map';
import type { PageMapItem } from 'nextra';
import 'nextra-theme-docs/style.css';
import themeConfig from '../../../../theme.config';
import { LanguageSwitch } from '@/components/shared/language-switch';

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

  const navbar = (
    <Navbar logo={themeConfig.logo} projectLink={undefined}>
      <LanguageSwitch />
    </Navbar>
  );

  const footer = <Footer>{themeConfig.footer?.text}</Footer>;

  return (
    <Layout
      navbar={navbar}
      footer={footer}
      pageMap={pageMap}
      docsRepositoryBase="https://github.com/okejob-hrms/web-hrms/tree/main/docs"
      editLink="Edit this page"
      sidebar={{
        defaultMenuCollapseLevel: 1,
        toggleButton: true,
      }}
    >
      {children}
    </Layout>
  );
}
