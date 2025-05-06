import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/wallet-api/:path*',
        // destination: 'https://rpc1-taupe.vercel.app/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ]
  }
};

export default nextConfig;