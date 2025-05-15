// src/services/solanaService.ts

// Type pour les résultats d'analyse Solana
interface SolanaAnalysisResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Cache pour éviter les appels redondants
const processedAddresses = new Map<string, any>();

/**
 * Service centralisé pour les appels Solana
 * Ce service s'assure qu'un appel n'est effectué qu'une seule fois par adresse
 */
export class SolanaService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    this.baseUrl += "/api/solscan";
  }

  // Récupère uniquement les tokens pour une adresse
  async getTokens(address: string): Promise<any> {
    // Vérifier si l'adresse est déjà dans le cache
    if (processedAddresses.has(`tokens-${address}`)) {
      console.log(`Retour du cache pour tokens: ${address}`);
      return processedAddresses.get(`tokens-${address}`);
    }

    try {
      console.log(`Fetching tokens pour: ${address}`);
      const response = await fetch(`${this.baseUrl}/tokens?address=${address}`, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      // Stocker dans le cache
      processedAddresses.set(`tokens-${address}`, data);
      
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des tokens:", error);
      throw error;
    }
  }

  // Méthode pour analyser une adresse Solana
  async analyzeAddress(address: string): Promise<SolanaAnalysisResult> {
    // Valider l'adresse Solana
    if (!address.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
      return {
        success: false,
        error: "Format d'adresse Solana invalide"
      };
    }

    try {
      // Récupérer uniquement les tokens
      const tokens = await this.getTokens(address);
      
      return {
        success: true,
        data: {
          address,
          tokens: tokens?.data || [],
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error("Erreur d'analyse d'adresse:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue"
      };
    }
  }

  // Méthode pour formater les résultats pour le LLM
  formatTokensForLLM(result: SolanaAnalysisResult): string {
    if (!result.success || !result.data) {
      return `Erreur lors de l'analyse: ${result.error || "Données indisponibles"}`;
    }

    const { tokens, address } = result.data;

    // Vérifier si les tokens sont disponibles
    if (!tokens || tokens.length === 0) {
      return `Aucun token trouvé pour l'adresse ${address}.`;
    }

    // Formater les informations des tokens
    let formattedText = `# Tokens trouvés pour l'adresse ${address}\n\n`;

    tokens.forEach((token: any, index: number) => {
      formattedText += `## Token ${index + 1}: ${token.symbol || 'Inconnu'}\n`;
      formattedText += `- Nom: ${token.name || 'Non spécifié'}\n`;
      formattedText += `- Quantité: ${token.amount || '0'}\n`;
      
      if (token.usdValue) {
        formattedText += `- Valeur estimée: $${parseFloat(token.usdValue).toFixed(2)}\n`;
      }
      
      formattedText += '\n';
    });

    formattedText += "Que souhaitez-vous savoir d'autre sur ces tokens?";
    return formattedText;
  }
}

// Exporter une instance unique
export const solanaService = new SolanaService();
export default solanaService;