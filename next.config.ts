import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".next-runtime",
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: false
  }
};

export default nextConfig;
