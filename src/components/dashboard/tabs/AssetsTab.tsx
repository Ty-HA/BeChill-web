import React from 'react';
import { RefreshCcw, ArrowUp, ArrowDown } from 'lucide-react';
import AssetGrowthChart from '@/components/dashboard/AssetGrowthChart';
import AssetDistributionChart from '@/components/dashboard/AssetDistributionChart';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AssetIcon from '@/components/ui/AssetIcon';
import { getAssetColor } from '@/utils/Formatter';

interface AssetsTabProps {
  isLoading: boolean;
  refreshData: () => void;
  lastUpdated: Date | null;
  totalValue: number;
  selectedTimeFrame: string;
  setSelectedTimeFrame: (timeFrame: string) => void;
  cryptoAssets: Array<{
    name: string;
    balance: string;
    value: string;
    change: string;
    trending: string;
    percentage: number;
  }>;
}

const AssetsTab: React.FC<AssetsTabProps> = ({
  isLoading,
  refreshData,
  lastUpdated,
  totalValue,
  selectedTimeFrame,
  setSelectedTimeFrame,
  cryptoAssets
}) => {
  // Nous utilisons maintenant la fonction importée depuis utils/formatters

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        {/* Valeur totale */}
        <div className="bg-white rounded-xl p-6 shadow-md col-span-1">
          <h2 className="text-lg font-bold text-gray-500 mb-2">Total Net Worth</h2>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="text-4xl font-bold text-[#7036cd] mb-2">
                €{totalValue.toFixed(2)}
              </div>
              <div className="flex items-center space-x-2 text-green-500">
                <ArrowUp size={16} />
                <span>+{(totalValue * 0.082).toFixed(2)}€</span>
                <span className="text-sm">+8.2%</span>
              </div>
              <div className="text-gray-400 text-sm mt-1">
                {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-600">≈ {(totalValue / 100).toFixed(3)} SOL</span>
                  <span className="text-xs text-gray-400">
                    Dernière mise à jour: {isLoading ? 'en cours...' : lastUpdated ? lastUpdated.toLocaleTimeString() : '2 min'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  {['1J', '7J', '1M', '1A', 'YTD', 'ALL'].map((frame) => (
                    <button
                      key={frame}
                      onClick={() => setSelectedTimeFrame(frame)}
                      className={`text-xs ${
                        selectedTimeFrame === frame 
                          ? 'bg-[#7036cd] text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      } px-2 py-1 rounded`}
                    >
                      {frame}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Graphique */}
        <div className="bg-white rounded-xl p-6 shadow-md col-span-1">
          <h2 className="text-lg font-bold text-gray-500 mb-4">Asset Growth</h2>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <AssetGrowthChart 
              assets={cryptoAssets} 
              totalValue={totalValue} 
              timeFrame={selectedTimeFrame}
            />
          )}
        </div>
        
        {/* Allocation */}
        <div className="bg-white rounded-xl p-6 shadow-md col-span-1">
          <h2 className="text-lg font-bold text-gray-500 mb-4">Allocation</h2>
          
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="flex-1 relative">
                <AssetDistributionChart assets={cryptoAssets} totalValue={totalValue} />
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="text-2xl font-bold text-[#7036cd]">€{totalValue.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                {cryptoAssets.map((asset, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${getAssetColor(asset.name)} mr-2`}></div>
                      <span className="text-sm">{asset.name.split(' ')[1].replace('(', '').replace(')', '')}</span>
                    </div>
                    <span className="text-sm">{asset.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Liste des actifs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#7036cd]">Mes actifs</h2>
          <div className="flex space-x-3">
            <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-lg">
              Voir plus
            </button>
            <button 
              className="text-xs bg-[#FFFF4F] hover:bg-yellow-300 text-[#7036cd] px-3 py-1 rounded-lg flex items-center"
              onClick={refreshData}
            >
              <RefreshCcw size={14} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="text-left py-3 px-4">Asset</th>
                <th className="text-right py-3 px-4">Balance</th>
                <th className="text-right py-3 px-4">Prix</th>
                <th className="text-right py-3 px-4">Valeur</th>
                <th className="text-right py-3 px-4">24h</th>
              </tr>
            </thead>
            <tbody>
              {cryptoAssets.map((asset, index) => (
                <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <AssetIcon symbol={asset.name.split(' ')[0]} />
                      <span className="ml-3 font-medium">{asset.name}</span>
                    </div>
                  </td>
                  <td className="text-right py-4 px-4 text-gray-800">{asset.balance}</td>
                  <td className="text-right py-4 px-4 text-gray-800">
                    {parseFloat(asset.balance.split(' ')[0]) > 0 
                      ? (parseFloat(asset.value.replace('€', '')) / parseFloat(asset.balance.split(' ')[0])).toFixed(2) 
                      : '0.00'}€
                  </td>
                  <td className="text-right py-4 px-4 font-medium">{asset.value}</td>
                  <td className="text-right py-4 px-4">
                    <div className="flex items-center justify-end">
                      <span className={asset.trending === 'up' ? 'text-green-500 mr-1' : 'text-red-500 mr-1'}>
                        {asset.change}
                      </span>
                      {asset.trending === 'up' ? (
                        <ArrowUp size={16} className="text-green-500" />
                      ) : (
                        <ArrowDown size={16} className="text-red-500" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AssetsTab;