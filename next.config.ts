import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin/auth pulls in jwks-rsa -> jose, whose ESM build breaks
  // when Turbopack bundles it for a Vercel serverless function
  // ("ERR_REQUIRE_ESM"). Marking the package external means Node loads it
  // natively at runtime instead of being rewritten by the bundler.
  serverExternalPackages: ["firebase-admin"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
    ],
    qualities: [60, 75, 80],
  },
};

export default nextConfig;
