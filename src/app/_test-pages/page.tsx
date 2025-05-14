// app/_test-pages/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TestIndex() {
  const router = useRouter();
  const [isLocalDev, setIsLocalDev] = useState(false);
  
  useEffect(() => {
    // Exécuter uniquement côté client
    const hostname = window.location.hostname;
    const isDev = hostname === 'localhost' || hostname.includes('127.0.0.1');
    setIsLocalDev(isDev);
    
    // Rediriger si nous ne sommes pas en développement
    if (!isDev) {
      router.replace('/');
    }
  }, [router]);
  
  // Rendu sécurisé pour éviter les problèmes avec SSR
  return (
    <div className="p-8">
      {isLocalDev ? (
        <>
          <h1 className="text-2xl font-bold mb-6">Pages de test</h1>
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800">
              ⚠️ Ces pages sont uniquement accessibles en environnement de développement.
            </p>
          </div>
          <ul className="space-y-2">
            <li className="rounded bg-gray-100 p-3 hover:bg-gray-200">
              <Link href="/test-api-tester">API Tester</Link>
            </li>
            <li className="rounded bg-gray-100 p-3 hover:bg-gray-200">
              <Link href="/test-dashboard">Dashboard</Link>
            </li>
            <li className="rounded bg-gray-100 p-3 hover:bg-gray-200">
              <Link href="/test-hf">HF Test</Link>
            </li>
            <li className="rounded bg-gray-100 p-3 hover:bg-gray-200">
              <Link href="/test-sonarwatch">Sonarwatch Test</Link>
            </li>
            <li className="rounded bg-gray-100 p-3 hover:bg-gray-200">
              <Link href="/test-wallet-analyzer">Wallet Analyzer</Link>
            </li>
          </ul>
        </>
      ) : (
        <h1 className="text-2xl font-bold text-red-600">
          Cette page n'est accessible qu'en développement local
        </h1>
      )}
    </div>
  );
}