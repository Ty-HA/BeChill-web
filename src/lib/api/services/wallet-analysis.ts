import { analyzeSolanaTokens } from '../blockchain/solana/actions/token-analysis';
import { analyzeSolanaNFTs } from '../blockchain/solana/actions/nft-analysis';
import { getSolanaAgent } from '../blockchain/solana/agent';
import { analyzeSecurityWithMCP } from '../blockchain/ai/mcp';

export async function getComprehensiveWalletAnalysis(address: string) {
  try {
    // Obtenir l'agent Solana
    const agent = getSolanaAgent(address);
    
    // Récupérer en parallèle les données sur les tokens et les NFTs
    const [tokenAnalysis, nftResult] = await Promise.all([
      analyzeSolanaTokens(address),
      analyzeSolanaNFTs(address)
    ]);
    
    // Ensure nftAnalysis conforms to the NFTAnalysis interface
    const nftAnalysis: NFTAnalysis = {
      suspiciousNFTs: nftResult.suspiciousNFTs,
      allNFTs: [], // Initialize with empty array since allNFTs property doesn't exist in nftResult
      riskLevel: (nftResult.riskLevel as string === "Medium" || nftResult.riskLevel as string === "High") 
        ? nftResult.riskLevel as "Medium" | "High" 
        : "Low"
    };
    
    // Préparer les données pour l'analyse AI
    const walletDetails = {
      address,
      totalValue: tokenAnalysis.totalValue,
      suspiciousTokens: tokenAnalysis.suspiciousTokens,
      suspiciousNFTs: nftAnalysis.suspiciousNFTs
    };
    
    // Format the data according to the expected structure
    const walletData = {
      wallet_data: walletDetails,
      tokens: tokenAnalysis.allTokens,
      nfts: nftAnalysis.allNFTs
    };
    
    // Obtenir l'analyse AI
    const aiAnalysis = await analyzeSecurityWithMCP(walletData);
    
    // Retourner les résultats complets
    return {
      raw_data: walletData,
      analysis: aiAnalysis,
      risk_assessment: {
        token_risk: tokenAnalysis.suspiciousTokens.length > 0 ? "High" : "Low",
        nft_risk: nftAnalysis.riskLevel,
        overall_risk: calculateOverallRisk(tokenAnalysis, nftAnalysis)
      }
    };
  } catch (error) {
    console.error("Error in wallet analysis:", error);
    throw error;
  }
}

interface TokenAnalysis {
  suspiciousTokens: any[];
  totalValue: number;
  allTokens: any[];
}

interface NFTAnalysis {
  suspiciousNFTs: any[];
  allNFTs: any[];
  riskLevel: "Low" | "Medium" | "High";
}

function calculateOverallRisk(tokenAnalysis: TokenAnalysis, nftAnalysis: NFTAnalysis) {
  // Logique pour calculer un niveau de risque global
  if (tokenAnalysis.suspiciousTokens.length > 0 && nftAnalysis.riskLevel === "High") {
    return "Critical";
  }
  
  if (tokenAnalysis.suspiciousTokens.length > 0 || nftAnalysis.riskLevel === "High") {
    return "High";
  }
  
  if (nftAnalysis.riskLevel === "Medium") {
    return "Medium";
  }
  
  return "Low";
}