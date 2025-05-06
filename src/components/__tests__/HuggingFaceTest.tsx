import React, { useState, useEffect } from 'react';
import { InferenceClient } from "@huggingface/inference";

// Récupérer la clé API depuis les variables d'environnement de Next.js
const API_KEY = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || '';

const HuggingFaceTest = () => {
  // État pour stocker la clé API, prérempli avec la valeur de l'environnement
  const [apiKey, setApiKey] = useState(API_KEY);
  const [userMessage, setUserMessage] = useState('');
  const [assistantMessage, setAssistantMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
      const client = new InferenceClient(apiKey);
      
      const messages = [
        {
          role: "user",
          content: userMessage
        }
      ];
      
      // Ajouter le message de l'assistant s'il existe
      if (assistantMessage) {
        messages.splice(1, 0, {
          role: "assistant",
          content: assistantMessage
        });
      }
      
      let output = "";
      // Utiliser la nouvelle méthode de l'API
      const stream = client.textGenerationStream({
        model: "Qwen/Qwen3-235B-A22B",
        inputs: userMessage,
        parameters: {
          temperature: 0.5,
          max_new_tokens: 500,
          top_p: 0.7,
        }
      });

      for await (const chunk of stream) {
        // La structure des chunks est différente avec textGenerationStream
        const newContent = chunk.token.text;
        output += newContent;
        setResponse(prev => prev + newContent);
      }
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'appel à l\'API');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Test Hugging Face Inference API</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Clé API Hugging Face</label>
        <input
          type="password"
          className="w-full p-2 border rounded"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Entrez votre clé API Hugging Face"
        />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Message utilisateur</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Entrez votre message ici"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Message assistant (optionnel)</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            value={assistantMessage}
            onChange={(e) => setAssistantMessage(e.target.value)}
            placeholder="Message précédent de l'assistant (optionnel)"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !apiKey || !userMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          {isLoading ? 'Chargement...' : 'Envoyer'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-4">
          <h2 className="text-lg font-medium mb-2">Réponse:</h2>
          <div className="p-3 bg-gray-100 rounded whitespace-pre-wrap">
            {response}
          </div>
        </div>
      )}
    </div>
  );
};

export default HuggingFaceTest;