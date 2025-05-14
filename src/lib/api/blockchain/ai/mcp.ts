// src/lib/ai/mcp.ts
import { DeepseekClient } from './clients/deepseek';
// Définissez les schémas MCP pour différentes analyses
export const SecurityAnalysisSchema = {
  input: {
    wallet_data: 'object',
    tokens: 'array',
    nfts: 'array'
  },
  output: {
    wallet_overview: 'string',
    token_analysis: 'string',
    nft_security: 'string',
    protection_tips: 'array'
  }
};

// Fonction qui utilise MCP pour standardiser les communications avec le modèle
export async function analyzeSecurityWithMCP(walletData: {
  wallet_data: object;
  tokens: any[];
  nfts: any[];
}) {
  const client = new DeepseekClient();
  
  // Format MCP standardisé
  const response = await client.process({
    schema: SecurityAnalysisSchema,
    data: walletData,
    instructions: `
      Analyze this wallet data and provide a security assessment.
      FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS:
      
      ## Wallet Overview
      [Single sentence about total value and token count]
      
      ## Token Analysis
      [Single sentence about token legitimacy, specifically addressing if "pump" tokens are suspicious]
      
      ## NFT Security Alert
      [Single sentence identifying suspicious NFTs with TIME LEFT attributes or external website links]
      
      ## Protection Tips
      • [First tip]
      • [Second tip]
      • [Third tip]
      
      STRICT REQUIREMENTS:
      - Total response must be under 100 words
      - Use warm, direct language
      - No explanations or thinking process
    `
  });
  
  return response;
}