import { getSolanaAgent } from '../agent';

interface NFT {
  name?: string;
  metadata?: {
    attributes?: Array<{
      trait_type?: string;
      value?: string;
    }>;
  };
}

export async function analyzeSolanaNFTs(address: string) {
  const agent = getSolanaAgent(address);
  
  try {
    // Utilisez les actions du plugin NFT
    const nfts = await agent.actions.getNfts({ ownerAddress: address });
    
    // Identifier les NFTs suspects
    const suspiciousNFTs = nfts.filter((nft: NFT) => {
      const metadata = nft.metadata || {};
      const attributes = metadata.attributes || [];
      
      // Vérifier les attributs suspects
      const hasTimeLeftAttribute = attributes.some(attr => 
        attr.trait_type?.toLowerCase().includes('time') && 
        attr.trait_type?.toLowerCase().includes('left')
      );
      
      const hasWebsiteAttribute = attributes.some(attr => 
        attr.trait_type?.toLowerCase().includes('website') ||
        attr.trait_type?.toLowerCase().includes('url') ||
        attr.trait_type?.toLowerCase().includes('link')
      );
      
      // Vérifier le nom pour des indications de phishing
      const suspiciousNameWords = ['airdrop', 'drop', 'free', 'claim'];
      const nameHasSuspiciousWords = suspiciousNameWords.some(word => 
        nft.name?.toLowerCase().includes(word)
      );
      
      return hasTimeLeftAttribute || hasWebsiteAttribute || nameHasSuspiciousWords;
    });
    
return {
  suspiciousNFTs,
  riskLevel: calculateNFTRiskLevel(nfts, suspiciousNFTs)
};
  } catch (error) {
    console.error("Error analyzing NFTs:", error);
    throw error;
  }
}

function calculateNFTRiskLevel(allNFTs: any[], suspiciousNFTs: any[]) {
  if (suspiciousNFTs.length === 0) return "Low";
  
  const ratio = suspiciousNFTs.length / allNFTs.length;
  if (ratio > 0.5) return "High";
  if (ratio > 0.2) return "Medium";
  return "Low";
}