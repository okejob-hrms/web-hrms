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

async function probeDocsRuntime(locale: 'en' | 'id') {
  const probes: Array<[string, () => Promise<unknown>]> = [
    ['next-themes', () => import('next-themes')],
    ['zod', () => import('zod')],
    ['@headlessui/react', () => import('@headlessui/react')],
    ['@floating-ui/react', () => import('@floating-ui/react')],
  ];

  for (const [name, load] of probes) {
    try {
      await load();
      console.info(`[docs/${locale}] probe ok ${name}`);
    } catch (error) {
      console.error(`[docs/${locale}] probe FAILED ${name}`, error);
    }
  }
}

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pageMap = await loadDocsPageMap('id');
  await probeDocsRuntime('id');

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
      search={null}
      docsRepositoryBase="https://github.com/okejob-hrms/web-hrms/tree/main/docs"
      editLink="Edit halaman ini"
      sidebar={{
        defaultMenuCollapseLevel: 1,
        toggleButton: true,
      }}
      nextThemes={{
        attribute: 'class',
        defaultTheme: 'light',
        disableTransitionOnChange: true,
      }}
    >
      {children}
    </Layout>
  );
}
