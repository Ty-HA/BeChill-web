'use client';

import { useState } from 'react';

export default function SonarwatchTestPage() {
  const [wallet, setWallet] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/fetch-wallet?address=${wallet}`);
      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Erreur inconnue');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Test SonarWatch</h1>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Adresse du wallet Solana"
          className="border p-2 rounded w-full"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={fetchData}
          disabled={loading || !wallet}
        >
          {loading ? 'Chargement...' : 'Analyser'}
        </button>
      </div>

      {error && <div className="text-red-500">Erreur : {error}</div>}

      {result && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">📊 Tokens</h2>
          <ul className="space-y-2">
            {result
              .find((r: any) => r.platformId === 'wallet-tokens')
              ?.data.assets.map((token: any, i: number) => (
                <li key={i} className="border p-2 rounded">
                  <div>Adresse : {token.data.address}</div>
                  <div>Montant : {token.data.amount}</div>
                  <div>Prix unitaire : {token.data.price}</div>
                  <div>Valeur totale : {token.value?.toFixed(2)} $</div>
                </li>
              ))}
          </ul>

          <h2 className="text-xl font-semibold">🖼️ NFTs</h2>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {result
              .find((r: any) => r.platformId === 'wallet-nfts')
              ?.data.assets.map((nft: any, i: number) => (
                <li key={i} className="border p-2 rounded">
                  <img
                    src={nft.imageUri}
                    alt={nft.name}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <div className="font-bold">{nft.name}</div>
                  <div className="text-sm text-gray-600">
                    {nft.data.collection?.name || 'Sans collection'}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
