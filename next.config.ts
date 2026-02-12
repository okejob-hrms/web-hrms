import nextra from 'nextra'
import type { NextConfig } from 'next'

const withNextra = nextra({})

const nextConfig: NextConfig = {
  devIndicators: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  turbopack: {
    resolveAlias: {
      'next-mdx-import-source-file': './src/mdx-components.tsx',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "face.okejobhub.fun",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "bucket.okejobhub.fun",
        pathname: "/**",
      },
    ],
  },
}

export default withNextra(nextConfig)