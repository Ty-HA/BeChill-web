'use client';

import { useLogin, useLogout, usePrivy } from '@privy-io/react-auth';
import PrivyGate from '@/components/PrivyGate';

export default function HomePage() {
  const { login } = useLogin();
  const { logout } = useLogout();
  const { user } = usePrivy();

  return (
    <PrivyGate>
      <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <h1 className="text-3xl font-bold mb-6">Connexion Web3 avec Privy</h1>
        {user ? (
          <>
            <p className="text-lg bg-gray-700 px-4 py-2 rounded-lg mb-4">
              ✅ Connecté avec : {user.wallet?.address || 'Aucune adresse détectée'}
            </p>
            <button
              onClick={logout}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 transition-colors text-white font-semibold rounded-lg shadow-md"
            >
              Se déconnecter
            </button>
          </>
        ) : (
          <button
            onClick={login}
            className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 transition-colors text-white font-semibold rounded-lg shadow-md"
          >
            Se connecter avec Privy
          </button>
        )}
      </main>
    </PrivyGate>
  );
}