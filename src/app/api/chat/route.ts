import { NextRequest, NextResponse } from "next/server";
import {
  getRecentTransactions,
  enrichTransactionsWithTokenMetadata,
} from "@/lib/api-service";
import { spawn } from 'child_process';
import stripAnsi from 'strip-ansi';

// Configuration
const API_ENDPOINTS = {
  FETCH_WALLET: "/api/fetch-wallet"
};

// Query types et patterns
const QueryTypes = {
  NFT: ['nft', 'non fungible', 'collectible', /what.*own/i],
  PORTFOLIO: ['diversif', 'portfolio balance', /portfolio.*well/],
  TRANSACTIONS: ['transaction', 'history'],
  DEFI: ['defi', 'swap', 'stake', 'yield', 'liquidity', 'apy']
};

const TOKEN_REGEX = /\b(sol|usdc|eth|btc|bonk|jup|orca|ray|msol|jsol|usdt)\b/i;

// Fonction utilitaire pour récupérer les données du wallet de Sonarwatch
async function fetchWalletDataDirect(address: string): Promise<any[]> {
  const sonarwatchPath = '/Users/tyha/Projects/api/sonarwatch-backend';
  
  return new Promise((resolve, reject) => {
    const fetcher = spawn(
      'npx',
      ['nx', 'run', 'plugins:run-fetcher', 'wallet-tokens-solana', address],
      {
        cwd: sonarwatchPath,
        shell: true,
      }
    );

    let output = '';
    let errorOutput = '';

    fetcher.stdout.on('data', (data) => {
      output += data.toString();
    });

    fetcher.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    fetcher.on('close', () => {
      try {
        const cleanOutput = stripAnsi(output);

        const startIndex = cleanOutput.indexOf('[');
        const endIndex = cleanOutput.lastIndexOf(']') + 1;

        if (startIndex === -1 || endIndex === -1) {
          throw new Error('No JSON array found in output');
        }

        let jsonLike = cleanOutput.substring(startIndex, endIndex);

        // Remplacements pour corriger les erreurs de JSON :
        jsonLike = jsonLike
          .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // clé non-quotée => "clé":
          .replace(/'([^']*)'/g, (_, p1) => `"${p1.replace(/"/g, '\\"')}"`) // quotes simples => doubles
          .replace(/\bundefined\b/g, 'null'); // undefined => null

        const parsed = JSON.parse(jsonLike);
        resolve(parsed);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        reject(new Error(`Invalid output: ${errorMessage}`));
      }
    });
  });
}

// Data adapter function pour traiter les données de transaction
function adaptTransactionsData(apiData: any) {
  if (!apiData || !apiData.transactions || !apiData.transactions.results) {
    console.log("[API] Invalid data structure", apiData);
    return { transactions: [] };
  }

  try {
    const transactions = apiData.transactions.results.map((tx: any) => {
      // Get transaction signature
      let signature = "unknown";
      if (
        tx.transaction &&
        tx.transaction.signatures &&
        tx.transaction.signatures.length > 0
      ) {
        signature = tx.transaction.signatures[0];
      } else if (
        tx.transaction &&
        tx.transaction.message &&
        tx.transaction.message.accountKeys
      ) {
        signature = tx.transaction.message.accountKeys[0]?.pubkey || "unknown";
      }

      // Transaction timestamp
      const timestamp = tx.blockTime || Math.floor(Date.now() / 1000);

      // Determine transaction type based on logs with DeFi protocol detection
      let type = "Transfer";
      let protocol = "";
      if (tx.meta && tx.meta.logMessages) {
        const logs = tx.meta.logMessages.join(" ");

        // Check for specific DeFi protocols
        if (logs.includes("Jupiter")) {
          type = "Swap";
          protocol = "Jupiter";
        } else if (logs.includes("Raydium")) {
          type = "Swap";
          protocol = "Raydium";
        } else if (logs.includes("Orca")) {
          type = "Swap";
          protocol = "Orca";
        } else if (logs.includes("Stake")) {
          type = "Stake";
        } else if (logs.includes("Marinade")) {
          type = "Stake";
          protocol = "Marinade";
        } else if (logs.includes("Lido")) {
          type = "Stake";
          protocol = "Lido";
        } else if (logs.includes("Mint")) {
          type = "NFT Mint";
        } else if (logs.includes("Marketplace") || logs.includes("Sale")) {
          type = "NFT Trade";
        } else if (logs.includes("Deposit")) {
          type = "Deposit";
        } else if (logs.includes("Withdraw")) {
          type = "Withdraw";
        } else if (logs.includes("Liquidity")) {
          type = "Liquidity";
        } else if (logs.includes("Borrow")) {
          type = "Borrow";
        } else if (logs.includes("Repay")) {
          type = "Repay";
        }
      }

      // Analyze token transfers with token identification
      const tokenTransfers = [];

      // Simple balance difference calculation for SOL
      if (
        tx.meta &&
        tx.meta.preBalances &&
        tx.meta.postBalances &&
        tx.meta.preBalances.length > 0
      ) {
        const diff =
          (tx.meta.preBalances[0] - tx.meta.postBalances[0]) / 1000000000; // Convert lamports to SOL
        if (diff > 0) {
          tokenTransfers.push({
            amount: diff.toFixed(4),
            symbol: "SOL",
            type: "fungible",
            tokenMint: "So11111111111111111111111111111111111111112", // wSOL mint address
            usdValue: 0, // To be filled if price data is available
          });
        }
      }

      // Check for SPL token transfers
      if (tx.meta && tx.meta.postTokenBalances && tx.meta.preTokenBalances) {
        // Map to track balance changes by owner and mint
        const balanceChangesByOwnerAndMint = new Map();

        // Process pre-balances
        tx.meta.preTokenBalances.forEach((balance: any) => {
          const key = `${balance.owner}-${balance.mint}`;
          balanceChangesByOwnerAndMint.set(key, {
            owner: balance.owner,
            mint: balance.mint,
            preBalance: balance.uiTokenAmount?.uiAmount || 0,
            postBalance: 0, // Will be updated when processing postTokenBalances
            tokenProgram:
              balance.programId ||
              "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", // Default SPL token program
            tokenAccount: balance.accountIndex,
            decimals: balance.uiTokenAmount?.decimals,
            symbol: "", // To be filled if available
          });
        });

        // Process post-balances
        tx.meta.postTokenBalances.forEach((balance: any) => {
          const key = `${balance.owner}-${balance.mint}`;
          if (balanceChangesByOwnerAndMint.has(key)) {
            const existing = balanceChangesByOwnerAndMint.get(key);
            existing.postBalance = balance.uiTokenAmount?.uiAmount || 0;
          } else {
            balanceChangesByOwnerAndMint.set(key, {
              owner: balance.owner,
              mint: balance.mint,
              preBalance: 0,
              postBalance: balance.uiTokenAmount?.uiAmount || 0,
              tokenProgram:
                balance.programId ||
                "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              tokenAccount: balance.accountIndex,
              decimals: balance.uiTokenAmount?.decimals,
              symbol: "", // To be filled if available
            });
          }
        });

        // Calculate actual transfers
        for (const [key, value] of balanceChangesByOwnerAndMint.entries()) {
          const diff = value.postBalance - value.preBalance;

          // Skip entries with no change
          if (diff === 0) continue;

          // Determine if NFT (as a simple heuristic, if decimals = 0 and amount = 1, likely an NFT)
          const isNFT =
            value.decimals === 0 &&
            (value.preBalance === 1 || value.postBalance === 1);

          tokenTransfers.push({
            tokenMint: value.mint,
            owner: value.owner,
            amount: Math.abs(diff).toFixed(value.decimals || 4),
            direction: diff > 0 ? "in" : "out",
            type: isNFT ? "non-fungible" : "fungible",
            symbol: value.symbol || "", // Empty for now, to be filled if token metadata is available
            tokenType: isNFT ? "NFT" : "SPL Token",
          });
        }
      }

      // If no transfers detected, add a placeholder
      if (tokenTransfers.length === 0) {
        tokenTransfers.push({
          amount: "0.0000",
          symbol: "SOL",
          type: "fungible",
          tokenMint: "So11111111111111111111111111111111111111112",
        });
      }

      return {
        signature,
        timestamp,
        type,
        protocol: protocol || undefined,
        tokenTransfers,
        rawData: tx, // Keep raw data for debugging or further processing
      };
    });

    return { transactions };
  } catch (error) {
    console.error("[API] Error transforming transaction data:", error);
    return { transactions: [] };
  }
}

// Define the valid query types as a type
type QueryTypeKey = 'NFT' | 'PORTFOLIO' | 'TRANSACTIONS' | 'DEFI' | 'TOKEN' | 'UNKNOWN';

// Détecter le type de requête
function detectQueryType(message: string): QueryTypeKey {
  const messageLC = message.toLowerCase();
  
  for (const [type, patterns] of Object.entries(QueryTypes)) {
    if (patterns.some((pattern: string | RegExp) => 
      typeof pattern === 'string' 
        ? messageLC.includes(pattern) 
        : pattern.test(messageLC)
    )) {
      return type as QueryTypeKey;
    }
  }
  
  // Vérification des tokens spécifiques
  if (TOKEN_REGEX.test(messageLC)) {
    return 'TOKEN';
  }
  
  return 'UNKNOWN';
}

// Définir l'interface pour les handlers
type HandlerFunction = (walletAddress: string, message?: string) => Promise<any>;

// Handler pour les différents types de requêtes
const queryHandlers: Record<Exclude<QueryTypeKey, 'UNKNOWN'>, HandlerFunction> = {
  // Handler pour les requêtes NFT
  NFT: async (walletAddress: string) => {
    try {
      console.log("[API] Fetching NFTs from Sonarwatch");
      
      // Utiliser l'appel direct aux commandes Sonarwatch
      const nftData = await fetchWalletDataDirect(walletAddress);
      
      // Extraire les NFTs de la réponse
      const nftPlatform = nftData.find((r: any) => r.platformId === 'wallet-nfts');
      const nfts = nftPlatform?.data?.assets || [];

      if (nfts.length > 0) {
        return {
          response: `I found ${nfts.length} NFTs in your wallet:`,
          data: { nfts },
          type: "wallet-nfts",
        };
      } else {
        return {
          response: "I couldn't find any NFTs in your wallet.",
          data: { nfts: [] },
          type: "wallet-nfts",
        };
      }
    } catch (apiError) {
      console.error("[API] API Error when fetching NFTs:", apiError);
      return {
        response: "Unable to retrieve NFT data for this wallet.",
        data: { nfts: [] },
        type: "wallet-nfts",
      };
    }
  },
  
  // Handler pour les requêtes de diversification de portefeuille
  PORTFOLIO: async (walletAddress: string) => {
    try {
      console.log("[API] Analyzing portfolio diversification via Sonarwatch");
      
      // Utiliser l'appel direct aux commandes Sonarwatch
      const tokensData = await fetchWalletDataDirect(walletAddress);

      // Extraire les tokens de la réponse
      const tokenPlatform = tokensData.find(
        (r: any) => r.platformId === "wallet-tokens"
      );
      let tokens = [];
      let totalValue = 0;

      if (tokenPlatform && tokenPlatform.data && tokenPlatform.data.assets) {
        tokens = tokenPlatform.data.assets;
        // Calculer la valeur totale
        totalValue = tokens.reduce(
          (sum: number, token: any) => sum + (token.value || 0),
          0
        );
      }

      // Analyser la diversification
      let isDiversified = false;
      let mainTokenPercentage = 0;
      let diversificationMessage = "";

      if (tokens.length === 0) {
        diversificationMessage =
          "I couldn't find any tokens in your wallet to analyze diversification.";
      } else if (tokens.length === 1) {
        diversificationMessage =
          "Your portfolio consists of only one token, which means it's not diversified. Consider spreading your investment across different assets to reduce risk.";
      } else {
        // Trier les tokens par valeur
        tokens.sort((a: any, b: any) => (b.value || 0) - (a.value || 0));

        // Calculer le pourcentage du plus grand actif
        mainTokenPercentage =
          totalValue > 0
            ? Math.round(((tokens[0].value || 0) * 100) / totalValue)
            : 0;

        isDiversified = mainTokenPercentage < 50 && tokens.length >= 3;

        if (isDiversified) {
          diversificationMessage = `Your portfolio appears to be reasonably diversified with ${tokens.length} different tokens. Your largest holding represents ${mainTokenPercentage}% of your portfolio.`;
        } else {
          diversificationMessage = `Your portfolio could be more diversified. You have ${tokens.length} tokens, but your largest holding represents ${mainTokenPercentage}% of your total portfolio value.`;
        }
      }

      // Ajouter des recommandations
      const recommendations = [
        "Consider adding major cryptocurrencies (BTC, ETH, SOL) for stability",
        "Add some stablecoins (USDC, USDT) to reduce volatility",
        "Spread investments across different sectors in crypto (DeFi, gaming, infrastructure)",
        "Avoid having any single asset represent more than 30% of your portfolio",
      ];

      return {
        response: diversificationMessage,
        data: {
          isDiversified,
          mainTokenPercentage,
          tokenCount: tokens.length,
          recommendations,
          totalValue,
        },
        type: "portfolio-analysis",
      };
    } catch (apiError) {
      console.error("[API] API Error when analyzing portfolio:", apiError);
      return {
        response: "I couldn't analyze your portfolio diversification due to a technical issue. Please try again later.",
        data: {},
        type: "text",
      };
    }
  },
  
  // Handler pour les requêtes de transactions
  TRANSACTIONS: async (walletAddress: string) => {
    try {
      console.log("[API] Calling getRecentTransactions");
      // Récupérer les 10 transactions les plus récentes
      const apiData = await getRecentTransactions(walletAddress, 10);
      console.log("[API] Data received, adapting to format");
      
      const formattedData = adaptTransactionsData(apiData);
      
      // Essayer d'enrichir les transactions avec les métadonnées des tokens si possible
      try {
        console.log("[API] Enriching transactions with token metadata");
        formattedData.transactions = await enrichTransactionsWithTokenMetadata(formattedData.transactions);
      } catch (enrichError) {
        console.warn("[API] Error enriching transactions:", enrichError);
        // Continuer sans enrichissement
      }
      
      console.log("[API] Data successfully processed");
      
      return { 
        response: "Here are your most recent transactions:", 
        data: formattedData,
        type: "wallet-transaction" 
      };
    } catch (apiError) {
      console.error("[API] API Error:", apiError);
      
      const errorMessage = apiError instanceof Error ? apiError.message : "Unknown";
      return { 
        response: "Unable to retrieve transaction data for this wallet. Error: " + errorMessage, 
        data: { transactions: [] },
        type: "wallet-transaction"
      };
    }
  },
  
  // Handler pour les requêtes DeFi
  DEFI: async (walletAddress: string) => {
    try {
      console.log("[API] Filtering for DeFi transactions");
      const apiData = await getRecentTransactions(walletAddress, 20);
      const allData = adaptTransactionsData(apiData);

      // Filtrer les transactions pour ne montrer que celles liées à la DeFi
      const defiTypes = [
        "Swap",
        "Stake",
        "Liquidity",
        "Borrow",
        "Repay",
        "Deposit",
        "Withdraw",
      ];
      const defiTransactions = {
        transactions: allData.transactions.filter(
          (tx: any) => defiTypes.includes(tx.type) || tx.protocol
        ),
      };

      if (defiTransactions.transactions.length > 0) {
        return {
          response: "Here are your recent DeFi transactions:",
          data: defiTransactions,
          type: "wallet-transaction",
        };
      } else {
        return {
          response:
            "I couldn't find any DeFi transactions in your recent history.",
          data: { transactions: [] },
          type: "wallet-transaction",
        };
      }
    } catch (apiError) {
      console.error("[API] API Error:", apiError);
      return {
        response: "Unable to retrieve DeFi data for this wallet.",
        data: { transactions: [] },
        type: "wallet-transaction",
      };
    }
  },
  
  // Handler pour les requêtes spécifiques aux tokens
  TOKEN: async (walletAddress: string, message: string = "") => {
    const tokenMatch = message.toLowerCase().match(TOKEN_REGEX);
    if (!tokenMatch) return null;
    
    const tokenSymbol = tokenMatch[0].toUpperCase();
    try {
      console.log(`[API] Filtering for ${tokenSymbol} transactions`);
      const apiData = await getRecentTransactions(walletAddress, 20);
      const allData = adaptTransactionsData(apiData);

      // Filtrer les transactions pour ne montrer que celles avec le token spécifique
      const tokenTransactions = {
        transactions: allData.transactions.filter((tx: any) =>
          tx.tokenTransfers?.some(
            (transfer: any) => transfer.symbol.toUpperCase() === tokenSymbol
          )
        ),
      };

      if (tokenTransactions.transactions.length > 0) {
        return {
          response: `Here are your transactions involving ${tokenSymbol}:`,
          data: tokenTransactions,
          type: "wallet-transaction",
        };
      } else {
        return {
          response: `I couldn't find any transactions with ${tokenSymbol} in your recent history.`,
          data: { transactions: [] },
          type: "wallet-transaction",
        };
      }
    } catch (apiError) {
      console.error("[API] API Error:", apiError);
      return {
        response: `Unable to retrieve data for ${tokenSymbol}.`,
        data: { transactions: [] },
        type: "wallet-transaction",
      };
    }
  }
};

export async function POST(request: NextRequest) {
  console.log("[API] Starting POST request");
  try {
    const { message, walletAddress } = await request.json();
    console.log(
      `[API] Message: "${message}", Wallet: ${walletAddress?.slice(0, 6)}...`
    );

    if (!walletAddress) {
      return NextResponse.json({
        response: "To continue, I need a Solana wallet address.",
        requireWallet: true,
      });
    }

    // Déterminer le type de requête et traiter en conséquence
    const queryType = detectQueryType(message);
    
    if (queryType === 'TOKEN') {
      const result = await queryHandlers.TOKEN(walletAddress, message);
      if (result) {
        return NextResponse.json(result);
      }
    } else if (queryType !== 'UNKNOWN' && queryType in queryHandlers) {
      return NextResponse.json(await queryHandlers[queryType as Exclude<QueryTypeKey, 'UNKNOWN'>](walletAddress));
    }
    
    // Fallback pour les autres types de requêtes
    return NextResponse.json({
      response:
        "I don't fully understand your request. You can ask me about your transactions, NFTs, DeFi activity, portfolio diversification, or specific tokens like SOL or USDC.",
    });
  } catch (error) {
    console.error("[API] General error:", error);
    return NextResponse.json(
      {
        response: "An error occurred while processing your request.",
        data: { transactions: [] },
        type: "wallet-transaction",
      },
      { status: 200 }
    );
  }
}