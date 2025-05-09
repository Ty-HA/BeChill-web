// hooks/useHeliusData.js
import { useState, useEffect, useCallback } from 'react';
import { 
  fetchWalletData, 
  fetchSolBalance, 
  fetchTransactionHistory, 
  formatAssetsForDashboard 
} from '@/services/heliusService';

/**
 * Hook personnalisé pour gérer les données Helius
 * @param {string} walletAddress - Adresse du wallet Solana
 * @returns {Object} - États et fonctions pour gérer les données Helius
 */
const useHeliusData = (walletAddress) => {
  const [assets, setAssets] = useState([
    { name: 'Solana (SOL)', balance: '0.9 SOL', value: '€256.23', change: '+1.6%', trending: 'up', percentage: 62 },
    { name: 'Jupiter (JUP)', balance: '15.2 JUP', value: '€45.60', change: '+2.3%', trending: 'up', percentage: 25 },
    { name: 'Bonk (BONK)', balance: '25000 BONK', value: '€12.50', change: '-0.8%', trending: 'down', percentage: 12 },
  ]);
  const [transactions, setTransactions] = useState([]);
  const [totalValue, setTotalValue] = useState(314.33); // Valeur par défaut
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  /**
   * Formatage des transactions pour l'affichage
   */
  const formatTransactionsForDisplay = useCallback((txHistory) => {
    if (!txHistory || !Array.isArray(txHistory)) return [];
    
    return txHistory.map(tx => {
      try {
        const date = new Date(tx.blockTime * 1000);
        const formattedDate = date.toLocaleDateString('fr-FR', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
        
        let direction = 'out';
        let amount = '0.00';
        let tokenSymbol = 'SOL';
        let to = '';
        
        // Vérifier si les propriétés nécessaires existent
        if (tx.transaction && tx.transaction.message && tx.transaction.message.accountKeys) {
          to = tx.transaction.message.accountKeys[0].pubkey || 'Adresse inconnue';
        }
        
        return {
          date: formattedDate,
          type: 'Transfer',
          direction,
          amount: `${amount} ${tokenSymbol}`,
          to,
          timestamp: date.getTime()
        };
      } catch (error) {
        console.error('Erreur lors du formatage de la transaction:', error);
        return {
          date: new Date().toLocaleDateString('fr-FR'),
          type: 'Unknown',
          direction: 'out',
          amount: '? SOL',
          to: 'Unknown',
          timestamp: Date.now()
        };
      }
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, []);

  /**
   * Charge les données du wallet
   */
  const loadWalletData = useCallback(async () => {
    if (!walletAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Récupérer le solde SOL
      const solBalance = await fetchSolBalance(walletAddress);
      
      // Récupérer les tokens du wallet
      const walletData = await fetchWalletData(walletAddress);
      
      // Formater les données pour le dashboard
      const formattedAssets = await formatAssetsForDashboard(walletData?.items || [], solBalance);
      
      // Calculer la valeur totale
      const total = formattedAssets.reduce((sum, asset) => {
        return sum + parseFloat(asset.value.replace('€', ''));
      }, 0);
      
      // Mettre à jour les états
      setAssets(formattedAssets);
      setTotalValue(total);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des données du wallet:', error);
      setError('Impossible de charger les données du wallet.');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  /**
   * Charge l'historique des transactions
   * @param {number} limit - Nombre de transactions à récupérer
   */
  const loadTransactionHistory = useCallback(async (limit = 20) => {
    if (!walletAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Récupérer l'historique des transactions
      const txHistory = await fetchTransactionHistory(walletAddress, limit);
      
      // Formater les transactions
      const formattedTransactions = formatTransactionsForDisplay(txHistory);
      
      // Mettre à jour l'état
      setTransactions(formattedTransactions);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique des transactions:', error);
      setError('Impossible de charger l\'historique des transactions.');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, formatTransactionsForDisplay]);

  /**
   * Charge toutes les données
   */
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Utiliser Promise.all pour exécuter les deux requêtes en parallèle
      await Promise.all([
        loadWalletData(),
        loadTransactionHistory()
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Une erreur est survenue lors du chargement des données.');
    } finally {
      setIsLoading(false);
    }
  }, [loadWalletData, loadTransactionHistory]);

  // Charger les données au montage ou lorsque l'adresse du wallet change
  useEffect(() => {
    if (walletAddress) {
      refreshData();
    }
  }, [walletAddress, refreshData]);

  return {
    assets,
    transactions,
    totalValue,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    refreshWalletData: loadWalletData,
    refreshTransactionHistory: loadTransactionHistory
  };
};

export default useHeliusData;