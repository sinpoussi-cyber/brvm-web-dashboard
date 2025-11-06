'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { fr } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

interface CompanyChartProps {
  symbol: string;
}

export default function CompanyChart({ symbol }: CompanyChartProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchData();
  }, [symbol]);
  
  async function fetchData() {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/companies/${symbol}/historical`);
      
      if (!response.ok) {
        throw new Error('Impossible de charger les données');
      }
      
      const data = await response.json();
      
      if (!data.historical || data.historical.length === 0) {
        setError('Aucune donnée historique disponible');
        setLoading(false);
        return;
      }
      
      // Préparer les données pour le graphique
      const historicalData = data.historical.map((item: any) => ({
        x: new Date(item.trade_date),
        y: item.price
      }));
      
      const predictionData = data.predictions?.map((item: any) => ({
        x: new Date(item.prediction_date),
        y: item.predicted_price
      })) || [];
      
      // Ajouter le dernier point historique au début des prédictions
      if (historicalData.length > 0 && predictionData.length > 0) {
        predictionData.unshift(historicalData[historicalData.length - 1]);
      }
      
      setChartData({
        datasets: [
          {
            label: 'Historique',
            data: historicalData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 5,
          },
          {
            label: 'Prédictions',
            data: predictionData,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderDash: [5, 5],
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
          }
        ]
      });
      
    } catch (err) {
      console.error('Erreur chargement données:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }
  
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-800">
          {error}
        </div>
      </div>
    );
  }
  
  if (!chartData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-500">Aucune donnée disponible</p>
      </div>
    );
  }
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15
        }
      },
      title: {
        display: true,
        text: `Évolution du cours de ${symbol}`,
        font: {
          size: 18,
          weight: 'bold' as const
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'XOF',
                minimumFractionDigits: 0
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
          displayFormats: {
            day: 'dd MMM yyyy'
          }
        },
        adapters: {
          date: {
            locale: fr
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value);
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div style={{ height: '400px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
