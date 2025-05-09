import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getAssetColorValue } from '@/utils/Formatter'; // Chemin corrigé pour pointer vers le fichier formatters.ts

// Enregistrer les composants Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

interface AssetDistributionChartProps {
  assets: Array<{
    name: string;
    balance: string;
    value: string;
    change: string;
    trending: string;
    percentage: number;
  }>;
  totalValue: number;
}

const AssetDistributionChart: React.FC<AssetDistributionChartProps> = ({ assets, totalValue }) => {
  // Préparer les données pour le graphique en donut
  const chartData = {
    labels: assets.map(asset => asset.name.split(' ')[0]),
    datasets: [
      {
        data: assets.map(asset => asset.percentage),
        backgroundColor: assets.map(asset => getAssetColorValue(asset.name)),
        borderColor: 'white',
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      }
    }
  };
  
  return (
    <div className="h-40">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default AssetDistributionChart;