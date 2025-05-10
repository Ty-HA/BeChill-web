"use client";
// Old sonarwatch api test:
// import WalletAnalyzer from "@/components/wallet/WalletAnalyzer";
import DirectusExplorer from "@/components/analytics/DirectusExplorer";

export default function WalletAnalyzerPage() {
  return (
    <div className="p-6">
      <DirectusExplorer />
    </div>
  );
}
