import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  images: {
    domains: ['indoglobalstudies.org'],
    // or use remotePatterns for more control:
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'indoglobalstudies.org',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
