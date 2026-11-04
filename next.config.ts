import nextra from 'nextra';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const withNextra = nextra({});

const nextConfig: NextConfig = {
  output: 'standalone',
  // Webpack `next build --webpack` fails on Next 16.2+ with Nextra MDX
  // (`export const metadata` from a client-wrapped page). Production builds
  // use Turbopack (`next build`). postbuild still copies Nextra standalone deps.
  devIndicators: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  // Nextra Layout is often left as a traced package (not fully bundled). In Docker
  // the standalone tree has no parent node_modules, so theme deps must be included
  // explicitly — otherwise Layout SSR throws (digest) while local smoke still passes
  // via hoisting into the repo's node_modules.
  outputFileTracingIncludes: {
    '/docs/**/*': [
      './node_modules/nextra/**/*',
      './node_modules/nextra-theme-docs/**/*',
      './node_modules/next-themes/**/*',
      './node_modules/zod/**/*',
      './node_modules/@headlessui/react/**/*',
      './node_modules/@floating-ui/**/*',
      './node_modules/@react-aria/**/*',
      './node_modules/@react-stately/**/*',
      './node_modules/@tanstack/react-virtual/**/*',
      './node_modules/clsx/**/*',
      './node_modules/zustand/**/*',
      './node_modules/scroll-into-view-if-needed/**/*',
      './node_modules/compute-scroll-into-view/**/*',
      './node_modules/react-compiler-runtime/**/*',
    ],
    '/docs/en/**/*': [
      './node_modules/nextra/**/*',
      './node_modules/nextra-theme-docs/**/*',
      './node_modules/next-themes/**/*',
      './node_modules/zod/**/*',
      './node_modules/@headlessui/react/**/*',
      './node_modules/@floating-ui/**/*',
      './node_modules/@react-aria/**/*',
      './node_modules/@react-stately/**/*',
      './node_modules/@tanstack/react-virtual/**/*',
      './node_modules/clsx/**/*',
      './node_modules/zustand/**/*',
      './node_modules/scroll-into-view-if-needed/**/*',
      './node_modules/compute-scroll-into-view/**/*',
      './node_modules/react-compiler-runtime/**/*',
    ],
    '/docs/id/**/*': [
      './node_modules/nextra/**/*',
      './node_modules/nextra-theme-docs/**/*',
      './node_modules/next-themes/**/*',
      './node_modules/zod/**/*',
      './node_modules/@headlessui/react/**/*',
      './node_modules/@floating-ui/**/*',
      './node_modules/@react-aria/**/*',
      './node_modules/@react-stately/**/*',
      './node_modules/@tanstack/react-virtual/**/*',
      './node_modules/clsx/**/*',
      './node_modules/zustand/**/*',
      './node_modules/scroll-into-view-if-needed/**/*',
      './node_modules/compute-scroll-into-view/**/*',
      './node_modules/react-compiler-runtime/**/*',
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
