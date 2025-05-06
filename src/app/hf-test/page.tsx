'use client';
import React, { useState } from 'react';
import { InferenceClient } from "@huggingface/inference";

// Récupérer la clé API depuis les variables d'environnement de Next.js
const API_KEY = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || '';

export default function HuggingFacePage() {
  const [apiKey, setApiKey] = useState(API_KEY);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Exemple de portefeuille crypto avec 3 SOL et 2 meme coins
  const [portfolioData, setPortfolioData] = useState({
    "wallet": "Fc2UPMkgckcBSyKLpCHj3sMYsywjHsVwMZ74JczZP7cA",
    "totalValueUSD": 2380.45,
    "tokens": [
      {
        "name": "Solana",
        "symbol": "SOL",
        "amount": 12.5,
        "valueUSD": 1875.00,
        "percentOfPortfolio": 78.77
      },
      {
        "name": "Bonk",
        "symbol": "BONK",
        "amount": 5000000,
        "valueUSD": 250.00,
        "percentOfPortfolio": 10.5
      },
      {
        "name": "JitoSol",
        "symbol": "JitoSOL",
        "amount": 2.1,
        "valueUSD": 315.00,
        "percentOfPortfolio": 13.23
      },
      {
        "name": "DogWifHat",
        "symbol": "WIF",
        "amount": 420,
        "valueUSD": 168.00,
        "percentOfPortfolio": 7.06
      },
      {
        "name": "Marinade Staked SOL",
        "symbol": "mSOL",
        "amount": 0.5,
        "valueUSD": 75.00,
        "percentOfPortfolio": 3.15
      }
    ]
  });
  
  const handleUpdatePortfolio = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const updatedPortfolio = JSON.parse(e.target.value);
      setPortfolioData(updatedPortfolio);
    } catch (err) {
      // Si le JSON n'est pas valide, ne mettez pas à jour l'état
      console.error("JSON invalide:", err);
    }
  };

  const createPrompt = () => {
    return `
      You are a specialized crypto portfolio analyst. Given this detailed portfolio information:
      ${JSON.stringify(portfolioData, null, 2)}
      
      Provide 5 specific and personalized recommendations to improve portfolio diversification and risk management.
      Focus on actionable advice that directly addresses the issues in this specific portfolio.
      
      IMPORTANT:
      1. Each recommendation must be specific to THIS portfolio, not generic advice
      2. Include specific percentages and values when relevant
      3. Mention specific assets in the portfolio by name
      4. Suggest specific actions like "Reduce X by Y%" or "Consider adding Z"
      5. Format as a clean bullet list with each point starting with *
      
      Example of good recommendations:
      * Your Sahur token represents 97% of your portfolio. Reduce this position to less than 30% to minimize risk
      * Your portfolio lacks stablecoins - consider allocating 10-20% to USDC or USDT for stability
      * Add 1-2 large-cap tokens like BTC or ETH to balance your exposure to smaller tokens
    `;
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
      const client = new InferenceClient(apiKey);
      const prompt = createPrompt();
      
      let output = "";
      // Ajouter le provider
      const stream = client.chatCompletionStream({
        model: "Qwen/Qwen3-235B-A22B",
        provider: "novita", 
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 500,
        top_p: 0.7,
      });

      for await (const chunk of stream) {
        if (chunk.choices && chunk.choices.length > 0) {
          const newContent = chunk.choices[0].delta.content;
          output += newContent;
          setResponse(prev => prev + newContent);
        }
      }
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'appel à l\'API');
    } finally {
      setIsLoading(false);
    }
  };

  // Style personnalisé qui force le centrage et contourne les potentiels problèmes CSS
  const pageStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(to bottom, #a5c5f9 0%, #9fabf9 30%, #b5a0f0 50%, #e0c79c 100%)',
    backgroundAttachment: 'fixed',
    fontFamily: '"Poppins", sans-serif',
    padding: '0',
    margin: '0'
  };

  const contentStyle = {
    width: '100%',
    maxWidth: '768px',
    padding: '2rem',
    boxSizing: 'border-box' as 'border-box',
  };

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <h1 style={{textAlign: 'center', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold', fontFamily: '"Poppins", sans-serif'}}>
          Analyse de Portefeuille Crypto avec IA
        </h1>
        
        <div style={{marginBottom: '1rem'}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', fontFamily: '"Poppins", sans-serif'}}>
            Clé API Hugging Face
          </label>
          <input
            type="password"
            style={{width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem'}}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Entrez votre clé API Hugging Face"
          />
        </div>

        <div style={{marginBottom: '1rem'}}>
          <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', fontFamily: '"Poppins", sans-serif'}}>
            Données du Portefeuille (format JSON)
          </label>
          <textarea
            style={{width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontFamily: 'monospace', fontSize: '0.875rem'}}
            rows={15}
            onChange={handleUpdatePortfolio}
            defaultValue={JSON.stringify(portfolioData, null, 2)}
          />
        </div>

        <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !apiKey}
            style={{
              backgroundColor: isLoading || !apiKey ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '0.5rem 1.5rem',
              borderRadius: '0.375rem',
              cursor: isLoading || !apiKey ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Analyse en cours...' : 'Analyser le portefeuille'}
          </button>
        </div>

        {error && (
          <div style={{marginTop: '1rem', padding: '0.75rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '0.375rem', color: '#b91c1c'}}>
            {error}
          </div>
        )}

        {response && (
          <div style={{marginTop: '1rem', fontFamily: '"Poppins", sans-serif'}}>
            <h2 style={{fontSize: '1rem', fontWeight: '500', marginBottom: '0.5rem', fontFamily: '"Poppins", sans-serif'}}>
              Recommandations:
            </h2>
            <div style={{padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem', whiteSpace: 'pre-wrap', fontFamily: '"Poppins", sans-serif'}}>
              {response}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}