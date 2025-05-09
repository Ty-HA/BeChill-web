import React, { useState } from 'react';
import { testWalletAddress } from '@/services/heliusService';
import { formatWalletAddress } from '@/utils/walletAddressUtils';

interface TestWalletButtonProps {
  walletAddress?: string;
}

/**
 * Bouton de test pour un portefeuille Solana
 * Version simplifiée qui utilise toujours l'adresse Solana de test
 */
const TestWalletButton: React.FC<TestWalletButtonProps> = ({ walletAddress }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  // Adresse de test Solana (utilisée si walletAddress n'est pas fourni)
  const DEFAULT_TEST_ADDRESS = '6QU5GxYgQbCi87FHwJfk8BuSLZM4SxEvpdswrFXx5pSe';
  const testAddress = walletAddress || DEFAULT_TEST_ADDRESS;

  const handleTest = async () => {
    setIsLoading(true);
    setShowResults(true);
    
    try {
      // Appeler le service Helius simplifié
      const result = await testWalletAddress(testAddress);
      setTestResult(result);
    } catch (error) {
      console.error('Erreur pendant le test:', error);
      
      // Même en cas d'erreur, montrer des données de démo
      setTestResult({
        success: true,
        solBalance: 0.9,
        message: "Erreur API - Données de démonstration affichées"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleTest}
        className="bg-yellow-300 hover:bg-yellow-400 text-purple-800 font-bold py-2 px-4 rounded flex items-center justify-center"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Test en cours...
          </>
        ) : (
          <>Tester le wallet {formatWalletAddress(testAddress)}</>
        )}
      </button>

      {showResults && (
        <div className="mt-4 p-4 rounded-md border border-gray-200 bg-white">
          <h3 className="text-lg font-bold mb-2">Résultats du test</h3>
          
          {testResult === null ? (
            <p className="text-gray-500">Chargement des résultats...</p>
          ) : (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">✅ Test terminé</p>
              <p>Solde SOL: {testResult.solBalance || 0} SOL</p>
              {testResult.message && <p className="text-orange-500">{testResult.message}</p>}
              <div className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                <pre>
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setShowResults(false)}
            className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded text-sm"
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
};

export default TestWalletButton;