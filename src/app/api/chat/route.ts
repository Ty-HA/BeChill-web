import { NextRequest, NextResponse } from 'next/server';
import { getRecentTransactions } from '@/lib/api-service';

// Data adapter function - matches the one we tested in the Node script
function adaptTransactionsData(apiData: any) {
  if (!apiData || !apiData.transactions || !apiData.transactions.results) {
    console.log('[API] Invalid data structure', apiData);
    return { transactions: [] };
  }
  
  try {
    const transactions = apiData.transactions.results.map((tx: any) => {
      // Get transaction signature
      let signature = "unknown";
      if (tx.transaction && tx.transaction.signatures && tx.transaction.signatures.length > 0) {
        signature = tx.transaction.signatures[0];
      } else if (tx.transaction && tx.transaction.message && tx.transaction.message.accountKeys) {
        signature = tx.transaction.message.accountKeys[0]?.pubkey || "unknown";
      }
      
      // Transaction timestamp
      const timestamp = tx.blockTime || Math.floor(Date.now() / 1000);
      
      // Determine transaction type based on logs
      let type = "Transfer";
      if (tx.meta && tx.meta.logMessages) {
        const logs = tx.meta.logMessages.join(' ');
        if (logs.includes('Swap')) type = "Swap";
        else if (logs.includes('Stake')) type = "Stake";
      }
      
      // Analyze token transfers
      const tokenTransfers = [];
      
      // Simple balance difference calculation for SOL
      if (tx.meta && tx.meta.preBalances && tx.meta.postBalances && tx.meta.preBalances.length > 0) {
        const diff = (tx.meta.preBalances[0] - tx.meta.postBalances[0]) / 1000000000; // Convert lamports to SOL
        if (diff > 0) {
          tokenTransfers.push({
            amount: diff.toFixed(4),
            symbol: "SOL"
          });
        }
      }
      
      // If no transfers detected, add a placeholder
      if (tokenTransfers.length === 0) {
        tokenTransfers.push({
          amount: "0.0000",
          symbol: "SOL"
        });
      }
      
      return {
        signature,
        timestamp,
        type,
        tokenTransfers
      };
    });
    
    return { transactions };
  } catch (error) {
    console.error('[API] Error transforming transaction data:', error);
    return { transactions: [] };
  }
}

export async function POST(request: NextRequest) {
  console.log('[API] Starting POST request');
  try {
    const { message, walletAddress } = await request.json();
    console.log(`[API] Message: "${message}", Wallet: ${walletAddress?.slice(0, 6)}...`);
    
    if (!walletAddress) {
      return NextResponse.json({ 
        response: "To continue, I need a Solana wallet address.",
        requireWallet: true
      });
    }
    
    // Detect if the request is for transactions
    const messageLC = message.toLowerCase();
    if (messageLC.includes('transaction') || messageLC.includes('history')) {
      try {
        console.log('[API] Calling getRecentTransactions');
        // Get the 10 most recent transactions (forget about time period filtering)
        const apiData = await getRecentTransactions(walletAddress, 10);
        console.log('[API] Data received, adapting to format');
        
        // Adapt data to TransactionInfo format using our tested function
        const formattedData = adaptTransactionsData(apiData);
        console.log('[API] Data successfully adapted');
        
        return NextResponse.json({ 
          response: "Here are your most recent transactions:", 
          data: formattedData,
          type: "wallet-transaction" 
        });
      } catch (apiError) {
        console.error('[API] API Error:', apiError);
        
        const errorMessage = apiError instanceof Error ? apiError.message : "Unknown";
        return NextResponse.json({ 
          response: "Unable to retrieve transaction data for this wallet. Error: " + errorMessage, 
          data: { transactions: [] },
          type: "wallet-transaction" 
        }, { status: 200 }); // Use 200 even for errors to avoid 500 error
      }
    }
    
    // Handle other types of requests...
    return NextResponse.json({ 
      response: "I don't understand your request. Try asking about your transactions, balance, or portfolio analysis." 
    });
  } catch (error) {
    console.error('[API] General error:', error);
    return NextResponse.json({ 
      response: "An error occurred while processing your request.", 
      data: { transactions: [] },
      type: "wallet-transaction"
    }, { status: 200 }); // Use 200 even for errors to avoid 500 error
  }
}