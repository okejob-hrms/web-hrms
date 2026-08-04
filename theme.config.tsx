import { createElement, type ReactNode } from 'react';

const config: {
  logo: ReactNode;
  footer: { text: string };
  i18n: Array<{ locale: string; name: string }>;
  nextThemes: {
    attribute: string;
    defaultTheme: string;
    enableSystem: boolean;
  };
} = {
  logo: createElement('span', null, 'HRMS Docs'),
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
