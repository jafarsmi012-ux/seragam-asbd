import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Cloudflare Pages tidak support middleware output file
  // dan batasi image optimization
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
