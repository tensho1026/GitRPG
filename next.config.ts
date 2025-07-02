import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
  webpack(config) {
    config.externals.push({
      '@prisma/client': '@prisma/client',
    });
    return config;
  },
};

export default nextConfig;
