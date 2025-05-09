import { SolanaAgentKit, KeypairWallet } from "solana-agent-kit";
import TokenPlugin from "@solana-agent-kit/plugin-token";
import NFTPlugin from "@solana-agent-kit/plugin-nft";
import DefiPlugin from "@solana-agent-kit/plugin-defi";
import MiscPlugin from "@solana-agent-kit/plugin-misc";
import BlinksPlugin from "@solana-agent-kit/plugin-blinks";

// Pour un environnement frontend, vous voudrez probablement éviter de stocker une clé privée
// Vous pourriez utiliser une connexion avec un wallet comme Phantom à la place
// Cet exemple est simplifié pour illustrer la structure
export const createSolanaAgent = (walletOrPubkey: KeypairWallet | string) => {
  // Si vous avez besoin d'un wallet complet pour les transactions
  // const wallet = new KeypairWallet(keyPair);
  
  // Pour une lecture seule, vous pouvez utiliser l'adresse publique
  const agent = new SolanaAgentKit(
    walletOrPubkey,
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
    {
      // Vous pourriez gérer les clés API via des variables d'environnement
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    }
  ) 
    .use(TokenPlugin)  // Pour l'analyse des tokens
    .use(NFTPlugin)    // Pour l'analyse des NFTs
    // Ajoutez d'autres plugins selon vos besoins
    .use(MiscPlugin);
    
  return agent;
};

// Exportez des fonctions utilitaires
export const getSolanaAgent = (address: string) => {
  return createSolanaAgent(address);
};