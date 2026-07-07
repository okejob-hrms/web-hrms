import { Layout, Navbar, Footer } from 'nextra-theme-docs';
import { getPageMap } from 'nextra/page-map';
import 'nextra-theme-docs/style.css';
import themeConfig from '../../../../theme.config';
import { LanguageSwitch } from '@/components/shared/language-switch';

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pageMap = await getPageMap('/docs/en');

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
