'use client';

import { Layout, Navbar, Footer } from 'nextra-theme-docs';
import type { PageMapItem } from 'nextra';
import themeConfig from '../../../theme.config';
import { LanguageSwitch } from '@/components/shared/language-switch';

type DocsNextraShellProps = {
  pageMap: PageMapItem[];
  children: React.ReactNode;
  editLink?: string;
};

/**
 * Nextra Layout/Navbar/Footer must run as a Client Component boundary.
 * Importing them directly from a Server Component layout can digest in
 * production Docker even when the same tree works in local standalone.
 */
export function DocsNextraShell({
  pageMap,
  children,
  editLink = 'Edit this page',
}: DocsNextraShellProps) {
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
      editLink={editLink}
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
