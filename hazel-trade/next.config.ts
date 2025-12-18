import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Disable TypeScript checking during build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
