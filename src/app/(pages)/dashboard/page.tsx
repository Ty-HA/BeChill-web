"use client";

import { useEffect, useState } from "react";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { getParsedTokenBalances } from "@/services/heliusService";
import Sidebar from "@/components/dashboard/SideBar";
import Header from "@/components/dashboard/Header";
import AssetsTab from "@/components/dashboard/tabs/AssetsTab";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TestWalletButton from "@/components/dashboard/TestWalletButton";
import ChatAdapter from "@/components/common/ChatAdapter";
import { normalizeSolanaAddress } from "@/utils/walletAddressUtils";

const BeChillDashboard = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [cryptoAssets, setCryptoAssets] = useState<any[]>([]);
  const [solPriceHistory, setSolPriceHistory] = useState<any[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("7J");
  const [manualAddress, setManualAddress] = useState("");

  const { user, ready } = usePrivy();
  const typedUser = user;
  const { login } = useLogin();

  // ✅ Fonction de chargement principale
  const loadOnchainData = async (address: string) => {
    if (!address) return;
    setIsLoading(true);

    try {
      const tokens = await getParsedTokenBalances(address);

      const enriched = await Promise.all(
        tokens.map(async (token) => {
          try {
            const res = await fetch(
              `https://37.187.141.70:8070/items/historical?filter[symbol][_eq]=${token.symbol}&sort=-datetime`
            );
            const json = await res.json();
            const price = json.data?.[0]?.price_usd || 0;

            return {
              symbol: token.symbol,
              balance: `${token.amount.toFixed(4)} ${token.symbol}`,
              amount: token.amount,
              valueEUR: token.amount * price,
              unitPrice: price,
            };
          } catch {
            return {
              symbol: token.symbol,
              balance: `${token.amount.toFixed(4)} ${token.symbol}`,
              amount: token.amount,
              valueEUR: 0,
              unitPrice: 0,
            };
          }
        })
      );

      const total = enriched.reduce((sum, a) => sum + a.valueEUR, 0);
      setCryptoAssets(enriched);
      setTotalValue(total);
      setLastUpdated(new Date());

      const resSol = await fetch(
        "/api/directus-historical?filterType=symbol&filterValue=SOL&sort=-datetime"
      );

      const jsonSol = await resSol.json();
      console.log("📊 Sol price history fetched:", jsonSol.data?.slice(0, 3));
      setSolPriceHistory(
        (jsonSol.data || []).map((entry: any) => ({
          date: entry.datetime,
          price_usd: entry.price_usd,
        }))
      );
    } catch (e) {
      console.error("💥 Load error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Effet initial
  useEffect(() => {
    if (ready && typedUser?.wallet?.address) {
      const raw = typedUser.wallet.address;
      setWalletAddress(raw);
      const normalized = normalizeSolanaAddress(raw);
      if (normalized) loadOnchainData(normalized);
    }
  }, [ready, typedUser]);

  // Effet pour charger l'historique SOL au démarrage
  useEffect(() => {
    const loadSolanaHistory = async () => {
      try {
        const res = await fetch(
          "/api/directus-historical?filterType=symbol&filterValue=SOL&sort=-datetime"
        );
        const json = await res.json();

        // 💡 Conversion en PricePoint[]
        const history = (json.data || [])
          .filter(
            (entry: any) =>
              typeof entry.price_usd === "number" && entry.datetime
          )
          .map((entry: any) => ({
            date: entry.datetime,
            price_usd: entry.price_usd,
          }));

        setSolPriceHistory(history);
        console.log("✅ SOL Price History:", history.slice(0, 3));
      } catch (e) {
        console.error("🔴 Erreur chargement prix SOL:", e);
      }
    };

    loadSolanaHistory();
  }, []);

  return (
    <div className="min-h-screen flex bg-gradient-to-r from-[#DDDAF6] to-[#C6D9FF] font-serif">
      <Sidebar
        activeTab="assets"
        setActiveTab={() => {}}
        walletAddress={walletAddress}
        connectWallet={() => {}}
      />

      <main className="ml-64 flex-1 py-4 px-6">
        <Header
          activeTab="assets"
          walletAddress={walletAddress}
          isLoading={isLoading}
          refreshData={() => walletAddress && loadOnchainData(walletAddress)}
          isPrivyConnected={!!typedUser?.wallet?.address}
          manualAddress={manualAddress}
          setManualAddress={setManualAddress}
          onManualSearch={() => {
            if (manualAddress) {
              setWalletAddress(manualAddress);
              loadOnchainData(manualAddress);
            }
          }}
        />

        <TestWalletButton
          walletAddress={manualAddress || walletAddress || undefined}
        />

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <AssetsTab
            isLoading={isLoading}
            refreshData={() => walletAddress && loadOnchainData(walletAddress)}
            lastUpdated={lastUpdated}
            totalValue={totalValue}
            selectedTimeFrame={selectedTimeFrame}
            setSelectedTimeFrame={setSelectedTimeFrame}
            cryptoAssets={cryptoAssets}
            solPriceHistory={solPriceHistory}
          />
        )}

        <ChatAdapter
          isFloating={true}
          userWallet={typedUser?.wallet?.address || null}
          className="w-full max-w-md mx-auto fixed bottom-6 left-0 right-0 z-20"
          onRequestWalletConnect={login}
          onSendMessage={() => {}}
          initialMessages={[]}
          onMessagesUpdate={() => {}}
        />
      </main>
    </div>
  );
};

export default BeChillDashboard;
