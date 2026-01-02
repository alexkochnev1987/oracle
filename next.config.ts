import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Allow base64 images (data URLs work without configuration)
    unoptimized: false,
  },
  // Exclude large files from serverless function tracing
  outputFileTracingExcludes: {
    "*": [
      // Exclude large images from public folder (they're static assets, not needed in serverless functions)
      "public/alien/**",
      "public/**/*.png",
      "public/girl/**",
      "public/man/**",
      "public/robot/**",
      // Exclude docs
      "docs/**",
      // Exclude test files
      "scripts/**",
      "oracle/src/testing/**",
    ],
  },
};

export default nextConfig;
