import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, TimeScale, Tooltip, Legend } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import { stockDataService } from '../../../services/stockDataService';
import './ChartModal.css';

ChartJS.register(CategoryScale, LinearScale, TimeScale, Tooltip, Legend, CandlestickController, CandlestickElement);

interface ChartModalProps {
  symbol: string;
  onClose: () => void;
}

export const ChartModal: React.FC<ChartModalProps> = ({ symbol, onClose }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await stockDataService.getEODData(symbol);
        const candles = data.data.map((item: any) => ({
          x: new Date(item.date).getTime(),
          o: item.open,
          h: item.high,
          l: item.low,
          c: item.close
        }));

        setChartData({
          datasets: [{
            label: symbol,
            data: candles,
            borderColor: 'rgb(0, 212, 170)',
            backgroundColor: 'rgba(0, 212, 170, 0.5)'
          }]
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [symbol]);

  return (
    <div className="chart-modal-overlay" onClick={onClose}>
      <div className="chart-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="chart-modal-header">
          <h2>{symbol} - Candlestick Chart</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        <div className="chart-container">
          {loading ? (
            <div className="loading">Loading chart...</div>
          ) : chartData ? (
            <Chart type="candlestick" data={chartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: { x: { type: 'time', time: { unit: 'day' } } }
            }} />
          ) : (
            <div className="error">Failed to load chart</div>
          )}
        </div>
      </div>
    </div>
  );
};

