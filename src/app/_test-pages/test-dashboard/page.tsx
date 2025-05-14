"use client";

import { useEffect, useState } from "react";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { normalizeSolanaAddress } from "@/utils/walletAddressUtils";
import Sidebar from "@/components/dashboard/SideBar";
import Header from "@/components/dashboard/Header";
import AssetsTab from "@/components/dashboard/tabs/AssetsTab";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TestWalletButton from "@/components/dashboard/TestWalletButton";
import ChatAdapter from "@/components/common/ChatAdapter";
import { loadTokenMap } from "@/lib/tokenMap";
import useHeliusData from "@/hooks/useHeliusData";

const BeChillDashboard = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [solPriceHistory, setSolPriceHistory] = useState<any[]>([]);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("7J");
  const [manualAddress, setManualAddress] = useState("");

  const {
    assets: cryptoAssets,
    transactions,
    totalValue,
    solBalance,
    isLoading,
    lastUpdated,
    refreshData,
  } = useHeliusData(walletAddress);

  const { user, ready } = usePrivy();
  const typedUser = user;
  const { login } = useLogin();

  useEffect(() => {
    loadTokenMap();
  }, []);

  // Effet initial : si connecté via Privy
  useEffect(() => {
    if (ready && typedUser?.wallet?.address) {
      const raw = typedUser.wallet.address;
      const normalized = normalizeSolanaAddress(raw);
      if (normalized) setWalletAddress(normalized);
    }
  }, [ready, typedUser]);

  // Charger l’historique du prix du SOL
  useEffect(() => {
    const loadSolanaHistory = async () => {
      try {
        const res = await fetch(
          "/api/directus-historical?filterType=symbol&filterValue=SOL&sort=-datetime"
        );
        const json = await res.json();
        const history = (json.data || [])
          .filter((entry: any) => typeof entry.price_usd === "number" && entry.datetime)
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
          refreshData={refreshData}
          isPrivyConnected={!!typedUser?.wallet?.address}
          manualAddress={manualAddress}
          setManualAddress={setManualAddress}
          onManualSearch={() => {
            const normalized = normalizeSolanaAddress(manualAddress);
            if (normalized) setWalletAddress(normalized);
          }}
        />

        <TestWalletButton walletAddress={manualAddress || walletAddress || undefined} />

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <AssetsTab
            isLoading={isLoading}
            refreshData={refreshData}
            lastUpdated={lastUpdated}
            totalValue={totalValue}
            solBalance={solBalance}
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
