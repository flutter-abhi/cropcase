import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable the new type checking for route handlers
  typedRoutes: false,
  typescript: {
    // Ignore type errors during build (temporary fix)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
