import { DocsThemeConfig } from 'nextra-theme-docs';

const config: DocsThemeConfig = {
  logo: <span>HRMS Docs</span>,
  footer: {
    text: 'OkeJobHub Documentation',
  },
  i18n: [
    { locale: 'en', name: 'English' },
    { locale: 'id', name: 'Bahasa Indonesia' },
  ],
  nextThemes: {
    attribute: 'class',
    defaultTheme: 'system',
    enableSystem: true,
  },
};

export default config;
