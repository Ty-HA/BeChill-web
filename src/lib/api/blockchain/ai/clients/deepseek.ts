import { InferenceClient } from "@huggingface/inference";

export class DeepseekClient {
  private client: InferenceClient;
  
  constructor(apiKey?: string) {
    // Utiliser la clé API fournie ou chercher dans les variables d'environnement
    this.client = new InferenceClient(
      apiKey || process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || ''
    );
  }
  
  async process({ schema, data, instructions }: { schema: any; data: any; instructions: string }) {
    try {
      const prompt = this.createPrompt(instructions, data);
      
      let output = "";
      const stream = await this.client.chatCompletionStream({
        model: "Qwen/Qwen3-235B-A22B", // Ou un autre modèle DeepSeek que vous préférez
        provider: "novita",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 800,
        top_p: 0.7,
      });

      // Collecter les résultats du stream
      for await (const chunk of stream) {
        if (chunk.choices && chunk.choices.length > 0) {
          const newContent = chunk.choices[0].delta.content;
          output += newContent;
        }
      }
      
      // Structurer la sortie selon le schéma fourni
      return this.formatOutput(output, schema);
    } catch (error) {
      console.error("Error in DeepSeek client:", error);
      throw error;
    }
  }
  
  private createPrompt(instructions: string, data: any): string {
    return `
      ${instructions}
      
      Data to analyze:
      \`\`\`json
      ${JSON.stringify(data, null, 2)}
      \`\`\`
    `;
  }
  
  private formatOutput(rawOutput: string, schema: any) {
    // Extraction basique des sections à partir de la sortie brute
    // Cette fonction pourrait être améliorée pour une correspondance plus précise avec le schéma
    
    const sections = {
      wallet_overview: "",
      token_analysis: "",
      nft_security: "",
      protection_tips: [] as string[]
    };
    
    // Extraction des sections basée sur les titres
    const walletOverviewMatch = rawOutput.match(/## Wallet Overview\s*([\s\S]*?)(?=##|$)/);
    if (walletOverviewMatch && walletOverviewMatch[1]) {
      sections.wallet_overview = walletOverviewMatch[1].trim();
    }
    
    const tokenAnalysisMatch = rawOutput.match(/## Token Analysis\s*([\s\S]*?)(?=##|$)/);
    if (tokenAnalysisMatch && tokenAnalysisMatch[1]) {
      sections.token_analysis = tokenAnalysisMatch[1].trim();
    }
    
    const nftSecurityMatch = rawOutput.match(/## NFT Security Alert\s*([\s\S]*?)(?=##|$)/);
    if (nftSecurityMatch && nftSecurityMatch[1]) {
      sections.nft_security = nftSecurityMatch[1].trim();
    }
    
    // Extraction des conseils de protection (bullet points)
    const protectionTipsMatch = rawOutput.match(/## Protection Tips\s*([\s\S]*?)(?=##|$)/);
    if (protectionTipsMatch && protectionTipsMatch[1]) {
      const tipsSection = protectionTipsMatch[1].trim();
      const tips = tipsSection.split(/•|\*/).filter(tip => tip.trim().length > 0);
      sections.protection_tips = tips.map(tip => tip.trim());
    }
    
    return sections;
  }
}