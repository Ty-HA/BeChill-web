// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production';
  const currentPath = request.nextUrl.pathname;
  
  // Liste des chemins de test qui ne doivent pas être accessibles en production
  const testPaths = [
    '/test-api-tester',
    '/test-dashboard',
    '/test-hf',
    '/test-sonarwatch',
    '/test-wallet-analyzer',
    '/tests'
  ];
  
  // En production, rediriger vers la page d'accueil
  if (isProduction && testPaths.some(path => 
    currentPath === path || currentPath.startsWith(`${path}/`)
  )) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/test-api-tester/:path*',
    '/test-dashboard/:path*',
    '/test-hf/:path*',
    '/test-sonarwatch/:path*',
    '/test-wallet-analyzer/:path*',
    '/tests'
  ],
};