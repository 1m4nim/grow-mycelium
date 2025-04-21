import type { NextConfig } from "next";

const nextConfig = {
  turbopack: true, // Turbopackを有効化
  experimental: {
    appDir: true, // 必要に応じて有効化
  },
};

export default nextConfig;
