import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ],
    domains: ["via.placeholder.com", "bucket.okejobhub.fun"],
  },
};

export default nextConfig;
