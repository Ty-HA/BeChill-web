import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AssetGrowthChartProps {
  assets: Array<{
    name: string;
    balance: string;
    value: string;
    change: string;
    trending: string;
    percentage: number;
  }>;
  totalValue: number;
  timeFrame: string;
}

const AssetGrowthChart: React.FC<AssetGrowthChartProps> = ({ assets, totalValue, timeFrame }) => {
  // Générer des données fictives basées sur le timeFrame sélectionné
  const generateData = () => {
    let labels: string[] = [];
    let dataPoints: number[] = [];
    
    // Déterminer le nombre de points et les labels en fonction du timeFrame
    switch (timeFrame) {
      case '1J':
        labels = ['00h', '04h', '08h', '12h', '16h', '20h', '24h'];
        break;
      case '7J':
        labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        break;
      case '1M':
        labels = ['S1', 'S2', 'S3', 'S4'];
        break;
      case '1A':
      case 'YTD':
        labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        break;
      case 'ALL':
        labels = ['2020', '2021', '2022', '2023', '2024', '2025'];
        break;
      default:
        labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    }
    
    // Générer des points de données avec une légère tendance à la hausse
    const baseValue = totalValue * 0.9;
    const variance = totalValue * 0.2;
    
    dataPoints = labels.map((_, index) => {
      const trend = index / labels.length * variance;
      const randomVariance = (Math.random() - 0.3) * (variance * 0.3);
      return baseValue + trend + randomVariance;
    });
    
    return { labels, dataPoints };
  };
  
  const { labels, dataPoints } = generateData();
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Portfolio Value',
        data: dataPoints,
        fill: true,
        backgroundColor: 'rgba(112, 54, 205, 0.1)',
        borderColor: '#7036cd',
        tension: 0.4,
        pointRadius: 2,
        pointBackgroundColor: '#7036cd'
      }
    ]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            return `€${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value: any) {
            return `€${value}`;
          }
        }
      }
    }
  };
  
  return (
    <div className="h-40">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default AssetGrowthChart;