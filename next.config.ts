import nextra from 'nextra';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const withNextra = nextra({});

const nextConfig: NextConfig = {
  output: 'standalone',
  // Turbopack `next build` (Next 16 default) omits Nextra docs layouts / page-map
  // from the standalone server bundle. Production builds must use webpack
  // (`next build --webpack` in package.json). Keep turbopack aliases for `next dev`.
  devIndicators: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  outputFileTracingIncludes: {
    '/docs/**/*': [
      './node_modules/nextra/**/*',
      './node_modules/nextra-theme-docs/**/*',
    ],
    '/docs/en/**/*': [
      './node_modules/nextra/**/*',
      './node_modules/nextra-theme-docs/**/*',
    ],
    '/docs/id/**/*': [
      './node_modules/nextra/**/*',
      './node_modules/nextra-theme-docs/**/*',
    ],
  },
  turbopack: {
    root: process.cwd(),
    resolveAlias: {
      'next-mdx-import-source-file': './src/mdx-components.tsx',
      'private-next-root-dir': '.',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'face.okejobhub.fun',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bucket.okejobhub.fun',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/firebase-messaging-sw.js',
        destination: '/api/firebase-sw',
      },
    ];
  },
};

export default withNextIntl(withNextra(nextConfig));
