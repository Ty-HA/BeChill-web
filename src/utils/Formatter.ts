/**
 * Formate les transactions pour l'affichage dans le tableau d'historique
 */
export const formatTransactionsForDashboard = (txHistory: any[]) => {
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
};

/**
 * Récupère la couleur associée à un actif
 */
export const getAssetColor = (assetName: string) => {
  const symbol = assetName.split(' ')[0];
  if (symbol === 'Solana') return 'bg-[#7036cd]';
  if (symbol === 'Jupiter') return 'bg-[#FFFF4F]';
  if (symbol === 'Bonk' || symbol === 'BONK') return 'bg-white border border-gray-300';
  return 'bg-gray-300';
};

/**
 * Récupère la valeur de couleur d'un actif (pour les styles CSS)
 */
export const getAssetColorValue = (assetName: string) => {
  const symbol = assetName.split(' ')[0];
  if (symbol === 'Solana') return '#7036cd';
  if (symbol === 'Jupiter') return '#FFFF4F';
  if (symbol === 'Bonk' || symbol === 'BONK') return 'white';
  return 'gray';
};