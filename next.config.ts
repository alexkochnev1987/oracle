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
};

export default nextConfig;
