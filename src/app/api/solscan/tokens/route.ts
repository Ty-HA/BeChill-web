// src/app/api/solscan/tokens/route.ts

import { NextRequest, NextResponse } from "next/server";

// Cache en mémoire pour éviter les appels redondants
const tokenCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes

// Endpoint pour récupérer les tokens
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Le paramètre 'address' est requis" },
        { status: 400 }
      );
    }

    // Validation du format d'adresse Solana
    if (!address.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
      return NextResponse.json(
        { error: "Format d'adresse Solana invalide" },
        { status: 400 }
      );
    }

    // Vérifier le cache
    const now = Date.now();
    const cachedData = tokenCache.get(address);
    
    if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
      console.log(`Utilisation du cache pour les tokens de l'adresse ${address}`);
      return NextResponse.json(cachedData.data);
    }

    // Si pas dans le cache, faire l'appel API
    console.log(`Récupération des tokens pour l'adresse ${address}`);
    
    // Simuler des données de tokens pour la démonstration
    // Remplacez ceci par votre appel API réel à Solscan ou autre service
    const tokens = await fetchTokenData(address);
    
    // Stocker dans le cache
    tokenCache.set(address, { data: tokens, timestamp: now });
    
    return NextResponse.json(tokens);
  } catch (error) {
    console.error("Erreur lors de la récupération des tokens:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// Fonction pour récupérer les données de token
// Remplacez par votre appel API réel
async function fetchTokenData(address: string) {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Données d'exemple - à remplacer par un appel API réel
  return {
    success: true,
    data: [
      {
        symbol: "SOL",
        name: "Solana",
        amount: "1.25",
        usdValue: "125.75"
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        amount: "150.00",
        usdValue: "150.00"
      },
      {
        symbol: "RAY",
        name: "Raydium",
        amount: "45.5",
        usdValue: "35.25"
      }
    ]
  };
}