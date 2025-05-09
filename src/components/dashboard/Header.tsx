import React from 'react';
import { RefreshCcw, Plus } from 'lucide-react';
import { formatWalletAddress } from '@/utils/walletAddressUtils';

interface HeaderProps {
  activeTab: string;
  walletAddress: string | null;
  isLoading: boolean;
  refreshData: () => void;
}

/**
 * Composant Header simplifiée au maximum
 */
const Header: React.FC<HeaderProps> = ({ activeTab, walletAddress, isLoading, refreshData }) => {
  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-[#7036cd]">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h1>
        {walletAddress && (
          <div className="text-sm text-gray-600 flex items-center">
            <span>Connected: </span>
            <span className="truncate ml-1 max-w-xs">{formatWalletAddress(walletAddress)}</span>
            <button 
              className="ml-2 text-purple-600 hover:text-purple-800"
              onClick={refreshData}
            >
              <RefreshCcw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        )}
      </div>
      <div className="flex space-x-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search..."
            className="w-64 bg-white text-gray-800 px-4 py-2 rounded-lg shadow" 
          />
          <div className="absolute right-3 top-2.5 text-gray-400">⌘K</div>
        </div>
        <button className="bg-[#FFFF4F] hover:bg-yellow-300 text-[#7036cd] px-6 py-2 rounded-lg shadow-md flex items-center">
          <Plus size={18} className="mr-2" />
          Ajouter des actifs
        </button>
      </div>
    </header>
  );
};

export default Header;