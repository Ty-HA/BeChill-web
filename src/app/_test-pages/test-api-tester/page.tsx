// src/app/test-api-tester/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import WalletTester from '@/components/wallet/WalletTester';

export default function ApiTesterPage() {
  const router = useRouter();
  const [isLocalDev, setIsLocalDev] = useState(false);
  
  useEffect(() => {
    // Vérification de l'environnement
    const hostname = window.location.hostname;
    const isDev = hostname === 'localhost' || hostname.includes('127.0.0.1');
    setIsLocalDev(isDev);
    
    // Redirection en production
    if (!isDev) {
      router.replace('/');
    }
  }, [router]);
  
  if (!isLocalDev) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mb-4 p-2 bg-yellow-100 border border-yellow-400 rounded max-w-6xl mx-auto">
        <p className="text-yellow-700">
          <strong>⚠️ Mode développement</strong> - Cette page n'est accessible qu'en environnement local.
        </p>
      </div>
      <WalletTester />
    </div>
  );
}