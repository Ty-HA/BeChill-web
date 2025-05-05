// app/api/nfts/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');
  
  if (!address) {
    return NextResponse.json({ error: 'Missing wallet address' }, { status: 400 });
  }
  
  try {
    // Call the Sonarwatch API
    const response = await fetch(`http://localhost:4000/api/fetch-wallet?address=${address}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from Sonarwatch: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract NFTs from the response
    const nftPlatform = data.find((r: any) => r.platformId === 'wallet-nfts');
    
    if (nftPlatform && nftPlatform.data && nftPlatform.data.assets) {
      return NextResponse.json({ nfts: nftPlatform.data.assets });
    }
    
    return NextResponse.json({ nfts: [] });
  } catch (error) {
    console.error('Error fetching from Sonarwatch:', error);
    return NextResponse.json({ error: 'Failed to fetch NFTs' }, { status: 500 });
  }
}