
import 'dotenv/config';
import { writeFile } from 'fs/promises';

const args = process.argv.slice(2);
const walletAddress = args[0] || process.env.ADDRESS_WALLET;

if (!walletAddress) {
  console.error('❌ Erreur: Aucune adresse de portefeuille fournie. Utilisez le format: node acc_bal_change.js ADDRESS_WALLET');
  process.exit(1);
}

const requestOptions = {
  method: "get",
  headers: {"token": process.env.SOLSCAN_API_KEY},
}

fetch(`https://pro-api.solscan.io/v2.0/account/balance_change?address=${walletAddress}&page_size=100&page=1&sort_by=block_time&sort_order=desc`, requestOptions)
  .then(response => response.json())
  .then(async response => {
    // Afficher la réponse avec une mise en forme améliorée
    console.log(JSON.stringify(response, null, 2));
    
    // L'adresse du portefeuille est déjà récupérée au début du script
    
    // Préparer le chemin du fichier avec l'adresse du portefeuille
    const outputFile = `output/balance_changes_${walletAddress}.json`;
    
    // Écrire les résultats dans un fichier JSON
    await writeFile(outputFile, JSON.stringify(response, null, 2));
    console.log(`Résultats écrits dans ${outputFile}`);
  })
  .catch(err => console.error(err));
    
    
