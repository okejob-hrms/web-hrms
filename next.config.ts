import nextra from 'nextra';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const withNextra = nextra({});

const nextConfig: NextConfig = {
  output: 'standalone',
  devIndicators: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  turbopack: {
    root: '.',
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
