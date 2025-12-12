import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  images: {
    // ✅ Remove "domains" (deprecated)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "indoglobalstudies.org",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "api.applystore.org",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
