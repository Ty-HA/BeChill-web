
// lib/sonarwatchService.ts
export async function fetchNFTsFromSonarwatch(walletAddress: string) {
    try {
      // Use the full URL with the correct protocol and host
      const response = await fetch(`http://localhost:4000/api/fetch-wallet?address=${walletAddress}`);
      
      if (!response.ok) {
        throw new Error(`Sonarwatch API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract NFTs from the response
      const nftPlatform = data.find((r: any) => r.platformId === 'wallet-nfts');
      
      if (nftPlatform && nftPlatform.data && nftPlatform.data.assets) {
        return nftPlatform.data.assets;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching NFTs from Sonarwatch:', error);
      return [];
    }
  }