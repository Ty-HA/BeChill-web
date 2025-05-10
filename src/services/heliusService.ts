// src/services/heliusService.ts
import axios from "axios";

const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY || "";
const HELIUS_API_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

const TOKEN_MINT_TO_SYMBOL: Record<string, string> = {
  "So11111111111111111111111111111111111111112": "SOL",
  "JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB": "JUP",
  "DezXfFz9NfUwU4QeEjGFk94QpKkpYzxhpT2RSyBPa9CH": "BONK",
};

export const refreshWalletData = async (address: string) => {
  try {
    const balanceResponse = await axios.post(HELIUS_API_URL, {
      jsonrpc: '2.0',
      id: 'balance',
      method: 'getBalance',
      params: [address]
    });

    const solBalance = balanceResponse.data?.result?.value / 10 ** 9 || 0;

    const parsedTokens = await getParsedTokenBalances(address);

    if (!parsedTokens.length) {
      console.warn("[HELIUS] Aucun token détecté dans ce wallet.");
    }

    return {
      success: true,
      solBalance,
      walletData: {},
      txHistory: [],
      formattedAssets: parsedTokens.map(token => ({
        symbol: token.symbol,
        amount: token.amount
      }))
    };
  } catch (error) {
    console.error('[HELIUS] refreshWalletData failed:', error);
    return {
      success: false,
      solBalance: 0,
      walletData: {},
      txHistory: [],
      formattedAssets: []
    };
  }
};

export const getParsedTokenBalances = async (
  walletAddress: string
): Promise<{ symbol: string; amount: number }[]> => {
  try {
    const response = await axios.post(HELIUS_API_URL, {
      jsonrpc: "2.0",
      id: "tokenBalances",
      method: "getTokenAccountsByOwner",
      params: [
        walletAddress,
        { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        { encoding: "jsonParsed" },
      ],
    });

    const accounts = response.data?.result?.value || [];

    if (!accounts.length) {
      console.warn("[HELIUS] Aucun token trouvé pour ce wallet.");
    }

    const tokens: { symbol: string; amount: number }[] = accounts
      .map((acc: any) => {
        const info = acc.account.data.parsed.info;
        const rawAmount = info.tokenAmount.uiAmount;
        const mint = info.mint;
        const symbol = TOKEN_MINT_TO_SYMBOL[mint] || mint;

        return {
          symbol,
          amount: rawAmount,
        };
      })
      .filter((t: { symbol: string; amount: number }) => t.amount > 0);

    return tokens;
  } catch (error) {
    console.error("[HELIUS] Échec récupération des tokens:", error);
    return [];
  }
};

export const testWalletAddress = async (address: string) => {
  try {
    const result = await refreshWalletData(address);
    return result;
  } catch (error) {
    console.error('[HELIUS] Test échoué:', error);
    return {
      success: false,
      solBalance: 0,
      message: "Échec du test Helius"
    };
  }
};