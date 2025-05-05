import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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