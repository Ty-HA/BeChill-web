'use client';

import { useState } from 'react';

export default function SolscanTestPage() {
  const [wallet, setWallet] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchPortfolio = async () => {
    setLoading(true);
    setData(null);

    try {
      const res = await fetch(`/api/portfolio?address=${wallet}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Erreur lors de l’appel API :', err);
      setData({ error: 'Erreur lors de l’appel API' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Test API Solscan</h1>

      <div style={{ marginTop: '1rem' }}>
        <input
          type="text"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          placeholder="Adresse wallet Solana"
          style={{ padding: '0.5rem', width: '300px' }}
        />
        <button onClick={fetchPortfolio} style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}>
          Tester
        </button>
      </div>

      {loading && <p>Chargement...</p>}

      {data && (
        <pre
          style={{
            marginTop: '2rem',
            background: '#f5f5f5',
            padding: '1rem',
            borderRadius: '8px',
            maxHeight: '500px',
            overflowY: 'scroll',
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
