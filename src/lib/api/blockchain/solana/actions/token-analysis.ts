import { getSolanaAgent } from '../agent';

export async function analyzeSolanaTokens(address: string) {
  const agent = getSolanaAgent(address);
  
  try {
    // Utilisez les actions du plugin Token
    const tokenBalances = await agent.actions.getTokenBalances({ ownerAddress: address });
    
    // Identifier les tokens suspects
    const suspiciousTokens = tokenBalances.filter((token: any) => 
      token.mint.toLowerCase().includes('pump') || 
      token.name?.toLowerCase().includes('pump')
    );
    
    return {
      allTokens: tokenBalances,
      suspiciousTokens,
      totalValue: calculateTotalValue(tokenBalances)
    };
  } catch (error) {
    console.error("Error analyzing tokens:", error);
    throw error;
  }
}

function calculateTotalValue(tokens: any[]) {
  // Calcul de la valeur totale des tokens
  return tokens.reduce((total, token) => total + (token.usdValue || 0), 0);
}