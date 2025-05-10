// src/app/api/performance/[walletAddress]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getParsedTokenBalances } from "@/services/heliusService";

const MINT_TO_SYMBOL: Record<string, string> = {
  "So11111111111111111111111111111111111111112": "SOL",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "USDC",
  "JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB": "JUP",
  "DezXfFz9NfUwU4QeEjGFk94QpKkpYzxhpT2RSyBPa9CH": "BONK",
};

const getHistoricalPrices = async (symbol: string) => {
  const res = await fetch(
    `http://37.187.141.70:8070/items/historical?filter[symbol][_eq]=${symbol}&sort=-datetime`
  );
  const json = await res.json();
  return json.data.map((entry: any) => ({
    date: entry.datetime,
    price_usd: entry.price_usd,
  }));
};

const calculateWalletPerformance = (
  tokens: { symbol: string; amount: number }[],
  priceData: Record<string, { priceHistory: { date: string; price_usd: number }[] }>
) => {
  let now = 0;
  let past = 0;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  tokens.forEach(({ symbol, amount }) => {
    const history = priceData[symbol]?.priceHistory || [];
    const priceToday = history[0]?.price_usd;
    const pricePast = history.find((h) => new Date(h.date) <= cutoff)?.price_usd;
    if (priceToday && pricePast) {
      now += amount * priceToday;
      past += amount * pricePast;
    }
  });

  const changePercent = past > 0 ? ((now - past) / past) * 100 : null;

  return {
    totalValueNow: now,
    totalValue30DaysAgo: past,
    changePercent,
  };
};

export async function GET(
  req: NextRequest,
  context: { params: { walletAddress: string } }
) {
  const walletAddress = context.params.walletAddress;

  try {
    const tokens = await getParsedTokenBalances(walletAddress);

    const result: Record<string, { amount: number; priceHistory: any[] }> = {};

    for (const token of tokens) {
      const symbol = MINT_TO_SYMBOL[token.symbol];
      if (!symbol) continue;

      const prices = await getHistoricalPrices(symbol);
      result[symbol] = {
        amount: token.amount,
        priceHistory: prices,
      };
    }

    const mappedTokens = tokens
      .filter((t) => !!MINT_TO_SYMBOL[t.symbol])
      .map((t) => ({ symbol: MINT_TO_SYMBOL[t.symbol], amount: t.amount }));

    const perf = calculateWalletPerformance(mappedTokens, result);

    return NextResponse.json({
      walletAddress,
      result,
      summary: perf,
    });
  } catch (e) {
    console.error("❌ Erreur performance:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
