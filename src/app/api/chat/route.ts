import { NextRequest, NextResponse } from "next/server";
import {
  getRecentTransactions,
  enrichTransactionsWithTokenMetadata,
} from "@/lib/api-service";

// Data adapter function for processing transaction data
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

    // Detect query types for portfolio
    const messageLC = message.toLowerCase();

    // NFT specific queries - USING SONARWATCH ON PORT 4000
    if (
      messageLC.includes("nft") ||
      messageLC.includes("non fungible") ||
      messageLC.includes("collectible") ||
      messageLC.match(/what.*own/i)
    ) {
      try {
        console.log("[API] Fetching NFTs from Sonarwatch on port 4000");

        // Use Sonarwatch running on port 4000
        const nftResponse = await fetch(
          `http://localhost:4000/api/fetch-wallet?address=${walletAddress}`
        );

        if (!nftResponse.ok) {
          throw new Error(`Failed to fetch NFTs: ${nftResponse.status}`);
        }

        const nftData = await nftResponse.json();
        
        // Extract NFTs from the Sonarwatch response
        const nftPlatform = nftData.find((r: any) => r.platformId === 'wallet-nfts');
        const nfts = nftPlatform?.data?.assets || [];

        if (nfts.length > 0) {
          return NextResponse.json({
            response: `I found ${nfts.length} NFTs in your wallet:`,
            data: { nfts },
            type: "wallet-nfts",
          });
        } else {
          return NextResponse.json({
            response: "I couldn't find any NFTs in your wallet.",
            data: { nfts: [] },
            type: "wallet-nfts",
          });
        }
      } catch (apiError) {
        console.error("[API] API Error when fetching NFTs:", apiError);
        return NextResponse.json(
          {
            response: "Unable to retrieve NFT data for this wallet.",
            data: { nfts: [] },
            type: "wallet-nfts",
          },
          { status: 200 }
        );
      }
    }

    // Portfolio diversification queries - USING SONARWATCH ON PORT 4000
    if (
      messageLC.includes("diversif") ||
      messageLC.includes("portfolio balance") ||
      (messageLC.includes("portfolio") && messageLC.includes("well"))
    ) {
      try {
        console.log("[API] Analyzing portfolio diversification via Sonarwatch");

        // Use Sonarwatch API running on port 4000 to get token data
        const tokensResponse = await fetch(
          `http://localhost:4000/api/fetch-wallet?address=${walletAddress}`
        );

        if (!tokensResponse.ok) {
          throw new Error(`Failed to fetch tokens: ${tokensResponse.status}`);
        }

        const tokensData = await tokensResponse.json();

        // Extract tokens from the response
        const tokenPlatform = tokensData.find(
          (r: any) => r.platformId === "wallet-tokens"
        );
        let tokens = [];
        let totalValue = 0;

        if (tokenPlatform && tokenPlatform.data && tokenPlatform.data.assets) {
          tokens = tokenPlatform.data.assets;
          // Calculate total value
          totalValue = tokens.reduce(
            (sum: number, token: any) => sum + (token.value || 0),
            0
          );
        }

        // Analyze diversification
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
          // Sort tokens by value
          tokens.sort((a: any, b: any) => (b.value || 0) - (a.value || 0));

          // Calculate percentage of the largest holding
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

        // Add recommendations
        const recommendations = [
          "Consider adding major cryptocurrencies (BTC, ETH, SOL) for stability",
          "Add some stablecoins (USDC, USDT) to reduce volatility",
          "Spread investments across different sectors in crypto (DeFi, gaming, infrastructure)",
          "Avoid having any single asset represent more than 30% of your portfolio",
        ];

        return NextResponse.json({
          response: diversificationMessage,
          data: {
            isDiversified,
            mainTokenPercentage,
            tokenCount: tokens.length,
            recommendations,
            totalValue,
          },
          type: "portfolio-analysis",
        });
      } catch (apiError) {
        console.error("[API] API Error when analyzing portfolio:", apiError);
        return NextResponse.json(
          {
            response:
              "I couldn't analyze your portfolio diversification due to a technical issue.",
            data: {},
            type: "text",
          },
          { status: 200 }
        );
      }
    }

    // ALL OTHER QUERIES USE PORT 3001 API
    
    // General transaction queries
    if (messageLC.includes("transaction") || messageLC.includes("history")) {
      try {
        console.log("[API] Calling getRecentTransactions on port 3001");
        // Get the 10 most recent transactions
        const apiData = await getRecentTransactions(walletAddress, 10);
        console.log("[API] Data received, adapting to format");
        
        const formattedData = adaptTransactionsData(apiData);
        
        // Try to enrich transactions with token metadata if possible
        try {
          console.log("[API] Enriching transactions with token metadata");
          formattedData.transactions = await enrichTransactionsWithTokenMetadata(formattedData.transactions);
        } catch (enrichError) {
          console.warn("[API] Error enriching transactions:", enrichError);
          // Continue without enrichment
        }
        
        console.log("[API] Data successfully processed");
        
        return NextResponse.json({ 
          response: "Here are your most recent transactions:", 
          data: formattedData,
          type: "wallet-transaction" 
        });
      } catch (apiError) {
        console.error("[API] API Error:", apiError);
        
        const errorMessage = apiError instanceof Error ? apiError.message : "Unknown";
        return NextResponse.json({ 
          response: "Unable to retrieve transaction data for this wallet. Error: " + errorMessage, 
          data: { transactions: [] },
          type: "wallet-transaction"
        }, { status: 200 });
      }
    }

    // DeFi specific queries - PORT 3001
    if (
      messageLC.includes("defi") ||
      messageLC.includes("swap") ||
      messageLC.includes("stake") ||
      messageLC.includes("yield") ||
      messageLC.includes("liquidity") ||
      messageLC.includes("apy")
    ) {
      try {
        console.log("[API] Filtering for DeFi transactions");
        const apiData = await getRecentTransactions(walletAddress, 20);
        const allData = adaptTransactionsData(apiData);

        // Filter transactions to show only those related to DeFi
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
          return NextResponse.json({
            response: "Here are your recent DeFi transactions:",
            data: defiTransactions,
            type: "wallet-transaction",
          });
        } else {
          return NextResponse.json({
            response:
              "I couldn't find any DeFi transactions in your recent history.",
            data: { transactions: [] },
            type: "wallet-transaction",
          });
        }
      } catch (apiError) {
        console.error("[API] API Error:", apiError);
        return NextResponse.json(
          {
            response: "Unable to retrieve DeFi data for this wallet.",
            data: { transactions: [] },
            type: "wallet-transaction",
          },
          { status: 200 }
        );
      }
    }

    // Specific token queries - PORT 3001
    const tokenRegex =
      /\b(sol|usdc|eth|btc|bonk|jup|orca|ray|msol|jsol|usdt)\b/i;
    const tokenMatch = messageLC.match(tokenRegex);

    if (tokenMatch) {
      const tokenSymbol = tokenMatch[0].toUpperCase();
      try {
        console.log(`[API] Filtering for ${tokenSymbol} transactions`);
        const apiData = await getRecentTransactions(walletAddress, 20);
        const allData = adaptTransactionsData(apiData);

        // Filter transactions to show only those with the specific token
        const tokenTransactions = {
          transactions: allData.transactions.filter((tx: any) =>
            tx.tokenTransfers?.some(
              (transfer: any) => transfer.symbol.toUpperCase() === tokenSymbol
            )
          ),
        };

        if (tokenTransactions.transactions.length > 0) {
          return NextResponse.json({
            response: `Here are your transactions involving ${tokenSymbol}:`,
            data: tokenTransactions,
            type: "wallet-transaction",
          });
        } else {
          return NextResponse.json({
            response: `I couldn't find any transactions with ${tokenSymbol} in your recent history.`,
            data: { transactions: [] },
            type: "wallet-transaction",
          });
        }
      } catch (apiError) {
        console.error("[API] API Error:", apiError);
        return NextResponse.json(
          {
            response: `Unable to retrieve data for ${tokenSymbol}.`,
            data: { transactions: [] },
            type: "wallet-transaction",
          },
          { status: 200 }
        );
      }
    }

    // Fallback for other types of queries
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