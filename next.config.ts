import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
  },
  
  // Utiliser le dossier standard
  distDir: '.next',
  
  async rewrites() {
    return [
      {
        source: '/wallet-api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://rpc1-taupe.vercel.app/api/:path*'
          : 'http://localhost:3001/api/:path*',
      },
      
      // En développement seulement, permettre l'accès aux pages de test
      ...(process.env.NODE_ENV !== 'production' ? [
        {
          source: '/test-api-tester',
          destination: '/_test-pages/test-api-tester',
        },
        {
          source: '/test-dashboard',
          destination: '/_test-pages/test-dashboard',
        },
        {
          source: '/test-hf',
          destination: '/_test-pages/test-hf',
        },
        {
          source: '/test-sonarwatch',
          destination: '/_test-pages/test-sonarwatch',
        },
        {
          source: '/test-wallet-analyzer',
          destination: '/_test-pages/test-wallet-analyzer',
        },
        {
          source: '/tests',
          destination: '/_test-pages',
        }
      ] : []),
    ];
  },
};

export default nextConfig;