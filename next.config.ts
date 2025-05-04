import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/wallet-api/:path*',
        destination: 'https://rpc1-taupe.vercel.app/api/:path*',
      },
    ]
  }
};

export default nextConfig;