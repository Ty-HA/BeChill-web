'use client';
import { useEffect, useState } from 'react';
import { useLogin, useLogout, usePrivy } from "@privy-io/react-auth";
import { refreshWalletData } from '@/services/heliusService';
import Sidebar from '@/components/dashboard/SideBar';
import Header from '@/components/dashboard/Header';
import AssetsTab from '@/components/dashboard/tabs/AssetsTab';
import HistoryTab from '@/components/dashboard/tabs/HistoryTab';
import ObjectivesTab from '@/components/dashboard/tabs/ObjectivesTab';
import ProfileTab from '@/components/dashboard/tabs/ProfileTab';
import ChatAdapter from '@/components/common/ChatAdapter';
import ChatComponent from '@/components/common/ChatComponent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatTransactionsForDashboard } from '@/utils/Formatter';
import TestWalletButton from '@/components/dashboard/TestWalletButton';
import { normalizeSolanaAddress } from '@/utils/walletAddressUtils';

const BeChillDashboard = () => {
  const [activeTab, setActiveTab] = useState('assets');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('7J');
  const [cryptoAssets, setCryptoAssets] = useState([
    { name: 'Solana (SOL)', balance: '0.9 SOL', value: '€256.23', change: '+1.6%', trending: 'up', percentage: 62 },
    { name: 'Jupiter (JUP)', balance: '15.2 JUP', value: '€45.60', change: '+2.3%', trending: 'up', percentage: 25 },
    { name: 'Bonk (BONK)', balance: '25000 BONK', value: '€12.50', change: '-0.8%', trending: 'down', percentage: 12 },
  ]);
  const [transactions, setTransactions] = useState<{
    date: string;
    type: string;
    direction: string;
    amount: string;
    to: string;
    timestamp: number;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [objectives, setObjectives] = useState([
    { goal: 'DCA 100 $SOL', description: 'through weekly investments', progress: 65, color: 'bg-purple-600' },
    { goal: 'DCA 100 $SOL', description: 'through weekly investments', progress: 65, color: 'bg-yellow-300' },
    { goal: 'DCA 100 $SOL', description: 'through weekly investments', progress: 65, color: 'bg-green-400' },
  ]);
  const [profile, setProfile] = useState({
    type: 'Moderate investor',
    description: 'You are a stable and goal-oriented investor who strives for a harmonized investment strategy that balances risk and reward.',
    chillScore: 78,
    riskScore: 25,
    bucketSplit: { speculative: 30, steady: 70 }
  });

  // État pour la gestion du chat
  const [walletReviewed, setWalletReviewed] = useState(false);
  const [savedMessages, setSavedMessages] = useState<any[]>([]);

  // Obtenir les informations sur l'utilisateur de Privy
  const { user, ready } = usePrivy();
  const typedUser = user;
  const { login } = useLogin();
  const { logout } = useLogout();

  // Fonction pour charger les données onchain
  const loadOnchainData = async (address: string) => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Utiliser la fonction tout-en-un pour récupérer les données du wallet
      const { solBalance, walletData, txHistory, formattedAssets } = await refreshWalletData(address);
      
      // Calculer la valeur totale
      const total = formattedAssets.reduce((sum, asset) => {
        return sum + parseFloat(asset.value.replace('€', ''));
      }, 0);
      
      // Formater les transactions pour le dashboard
      const formattedTransactions = formatTransactionsForDashboard(txHistory);
      
      // Mettre à jour les états
      setCryptoAssets(formattedAssets);
      setTransactions(formattedTransactions);
      setTotalValue(total);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des données onchain:', error);
      
      // Mode de secours - afficher des données de test si l'API échoue
      if (process.env.NEXT_PUBLIC_SIMULATION_MODE !== 'true') {
        // Si on n'est pas déjà en mode simulation, activer un mode de secours
        console.log("Activation du mode de secours avec données fictives");
        
        setCryptoAssets([
          { name: 'Solana (SOL)', balance: '0.9 SOL', value: '€256.23', change: '+1.6%', trending: 'up', percentage: 62 },
          { name: 'Jupiter (JUP)', balance: '15.2 JUP', value: '€45.60', change: '+2.3%', trending: 'up', percentage: 25 },
          { name: 'Bonk (BONK)', balance: '25000 BONK', value: '€12.50', change: '-0.8%', trending: 'down', percentage: 12 },
        ]);
        
        setTotalValue(314.33);
        setLastUpdated(new Date());
        setError('Mode de démonstration activé. Les données affichées sont fictives.');
      } else {
        setError('Impossible de charger les données du wallet.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Effet pour charger les données lorsque l'utilisateur est connecté
  useEffect(() => {
    if (ready && typedUser?.wallet?.address) {
      // Récupérer l'adresse brute du portefeuille depuis Privy
      const rawAddress = typedUser.wallet.address;
      
      // Stocker l'adresse brute pour l'affichage dans l'UI (sera formatée par le composant Header)
      setWalletAddress(rawAddress);
      
      // Normaliser l'adresse pour l'utilisation avec l'API Helius/Solana
      const normalizedAddress = normalizeSolanaAddress(rawAddress);
      
      // Utiliser l'adresse normalisée pour charger les données onchain
      if (normalizedAddress) {
        console.log(`Utilisation de l'adresse Solana: ${normalizedAddress}`);
        loadOnchainData(normalizedAddress);
      } else {
        console.error("Impossible de normaliser l'adresse du portefeuille");
      }
    }
  }, [ready, typedUser]);

  // Fonction pour rafraîchir les données
  const refreshData = () => {
    if (walletAddress) {
      loadOnchainData(walletAddress);
    }
  };

  // Fonction pour connecter un wallet différent
  const connectWallet = async () => {
    // Utiliser une adresse Solana de test au lieu de se connecter via Privy
    const testSolanaAddress = '6QU5GxYgQbCi87FHwJfk8BuSLZM4SxEvpdswrFXx5pSe';
    
    // Mettre à jour l'état avec l'adresse de test
    setWalletAddress(testSolanaAddress);
    
    // Charger les données avec cette adresse
    loadOnchainData(testSolanaAddress);
    
    console.log('📌 Utilisation de l\'adresse de test Solana pour la démo:', testSolanaAddress);
    
    // Si vous souhaitez toujours utiliser Privy mais de manière optionnelle
    // await login();
  };

  // Gestion des messages du chat
  const handleChatMessage = (message: string) => {
    console.log("Chat message received:", message);
    
    if (message === "wallet story") {
      console.log("Setting wallet as reviewed");
      setWalletReviewed(true);
    }
  };

  const saveMessages = (messages: any[]) => {
    setSavedMessages(messages);
  };

  const renderTabContent = () => {
    const tabProps = {
      isLoading,
      refreshData,
      lastUpdated,
      totalValue,
      selectedTimeFrame, 
      setSelectedTimeFrame,
      cryptoAssets,
      transactions,
      objectives,
      profile,
    };

    switch(activeTab) {
      case 'assets': return <AssetsTab {...tabProps} />;
      case 'objectives': return <ObjectivesTab objectives={objectives} />;
      case 'history': return <HistoryTab transactions={transactions} isLoading={isLoading} refreshData={refreshData} />;
      case 'profile': return <ProfileTab profile={profile} />;
      default: return <AssetsTab {...tabProps} />;
    }
  };
    
  return (
    <div className="min-h-screen flex bg-gradient-to-r from-[#DDDAF6] to-[#C6D9FF]">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        walletAddress={walletAddress}
        connectWallet={connectWallet}
      />
      
      {/* Main Content */}
      <main className="ml-64 flex-1 py-4 px-6">
        <Header 
          activeTab={activeTab}
          walletAddress={walletAddress}
          isLoading={isLoading}
          refreshData={refreshData}
        />
        
        {error && (
          <div className="bg-red-100 text-red-800 p-3 mb-4 rounded">
            
            {error}
          </div>
        )}
        <TestWalletButton walletAddress={walletAddress || undefined} />
        
        {renderTabContent()}
        
        {/* Composant de chat flottant */}
        <ChatAdapter
          isFloating={true}
          userWallet={typedUser?.wallet?.address || null}
          className="w-full max-w-md mx-auto fixed bottom-6 left-0 right-0 z-20"
          onRequestWalletConnect={login}
          onSendMessage={handleChatMessage}
          initialMessages={savedMessages}
          onMessagesUpdate={saveMessages}
        />
      </main>
    </div>
  );
};

export default BeChillDashboard;