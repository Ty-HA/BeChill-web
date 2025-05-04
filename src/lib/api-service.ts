// src/lib/api-service.ts
// Utiliser le proxy configuré dans next.config.ts
const API_BASE_URL = '/wallet-api'; // Ce sera redirigé vers https://rpc1-taupe.vercel.app/api/

// Portfolio endpoints
export async function getPortfolio(walletAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/portfolio/${walletAddress}`);
}

export async function getBalances(walletAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/portfolio/balances/${walletAddress}`);
}

export async function getAssets(walletAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/portfolio/assets/${walletAddress}`);
}

export async function getTransactionHistory(walletAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/portfolio/history/${walletAddress}`);
}

export async function getPortfolioAnalysis(walletAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/portfolio/analysis/${walletAddress}`);
}

export async function getTokenTransfers(walletAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/portfolio/token-transfers/${walletAddress}`);
}

// Token endpoints
export async function getToken(tokenAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/token/${tokenAddress}`);
}

export async function getTokenInfo(tokenAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/token/info/${tokenAddress}`);
}

export async function getTokenPrice(tokenAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/token/price/${tokenAddress}`);
}

export async function getTokenPriceHistory(tokenAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/token/price-history/${tokenAddress}`);
}

export async function getTokenMarketData(symbol: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/token/market-data/${symbol}`);
}

export async function compareTokens(tokens: string[]): Promise<any> {
  const tokensParam = tokens.join(',');
  return fetchData(`${API_BASE_URL}/token/compare?tokens=${tokensParam}`);
}

export async function getTokenLiquidity(tokenAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/token/liquidity/${tokenAddress}`);
}

export async function getTrendingTokens(): Promise<any> {
  return fetchData(`${API_BASE_URL}/token/trending`);
}

// Transaction endpoint
export async function getTransaction(signature: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/transaction/${signature}`);
}

// Pour compatibilité avec wallet-api.ts
export async function getLastTransaction(walletAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/portfolio/history/${walletAddress}?limit=1`);
}

export async function getRecentTransactions(walletAddress: string, days: number = 30): Promise<any> {
  // Ajouter les paramètres days et limit
  return fetchData(`${API_BASE_URL}/portfolio/history/${walletAddress}?limit=30&days=${days}`);
}

export async function getWalletBalance(walletAddress: string): Promise<any> {
  return getBalances(walletAddress);
}

export async function getWalletAnalysis(walletAddress: string): Promise<any> {
  return getPortfolioAnalysis(walletAddress);
}

// Fonction fetch améliorée avec gestion d'erreur
// Fonction fetch améliorée avec plus de logs
async function fetchData(url: string): Promise<any> {
    try {
      console.log(`[API Request] Starting request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      
      console.log(`[API Response] Status: ${response.status} for URL: ${url}`);
      
      // Récupérer le texte brut de la réponse d'abord
      const responseText = await response.text();
      console.log(`[API Response] Raw text length: ${responseText.length} characters`);
      
      if (!response.ok) {
        console.error(`[API Error] Status: ${response.status} for URL: ${url}`);
        console.error(`[API Error] Response body: ${responseText.substring(0, 500)}${responseText.length > 500 ? '...' : ''}`);
        throw new Error(`API error: ${response.status} - ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
      }
      
      // Convertir le texte en JSON si possible
      let data;
      try {
        data = JSON.parse(responseText);
        console.log(`[API Success] Parsed JSON data for URL: ${url}`);
      } catch (parseError) {
        console.error("[API Error] Failed to parse JSON:", parseError);
        console.error(`[API Error] Raw response: ${responseText.substring(0, 500)}${responseText.length > 500 ? '...' : ''}`);
        throw new Error(`Error parsing API response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }
      
      return data;
    } catch (error) {
      console.error("[API Error] Fetch error:", error);
      throw error;
    }
  }