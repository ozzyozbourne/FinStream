import React, { useEffect, useState, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, TimeScale, Tooltip, Legend, BarController, BarElement, LineController, LineElement, PointElement } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import { stockDataService } from '../../../services/stockDataService';
import './ChartModal.css';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  TimeScale, 
  Tooltip, 
  Legend, 
  CandlestickController, 
  CandlestickElement, 
  BarController, 
  BarElement,
  LineController,
  LineElement,
  PointElement
);

interface ChartModalProps {
  symbol: string;
  onClose: () => void;
}

export const ChartModal: React.FC<ChartModalProps> = ({ symbol, onClose }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const chartRef = useRef<any>(null);

  const calculateMA = (data: any[], period: number) => {
    const ma = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        ma.push({ x: data[i].x, y: null });
      } else {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.c, 0);
        ma.push({ x: data[i].x, y: sum / period });
      }
    }
    return ma;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await stockDataService.getEODData(symbol);
        const candles = data.data.map((item: any) => ({
          x: new Date(item.date).getTime(),
          o: item.open,
          h: item.high,
          l: item.low,
          c: item.close,
          v: item.volume
        }));

        const ma20 = calculateMA(candles, 20);
        const ma50 = calculateMA(candles, 50);

        const startDate = new Date(data.meta.date_from).toLocaleDateString();
        const endDate = new Date(data.meta.date_to).toLocaleDateString();
        setDateRange(`${startDate} - ${endDate}`);

        const latest = candles[candles.length - 1];
        const previous = candles[candles.length - 2];
        const change = latest.c - previous.c;
        const changePercent = (change / previous.c) * 100;

        setStats({
          current: latest.c,
          change: change,
          changePercent: changePercent,
          high: Math.max(...candles.map((c: any) => c.h)),
          low: Math.min(...candles.map((c: any) => c.l)),
          volume: latest.v
        });

        setChartData({
          datasets: [
            {
              type: 'candlestick',
              label: symbol,
              data: candles,
              yAxisID: 'y',
              color: {
                up: '#00d4aa',
                down: '#ff6b6b',
                unchanged: '#999'
              },
              borderColor: {
                up: '#00d4aa',
                down: '#ff6b6b',
                unchanged: '#999'
              }
            },
            {
              type: 'line',
              label: 'MA(20)',
              data: ma20,
              yAxisID: 'y',
              borderColor: '#ffa500',
              borderWidth: 1.5,
              pointRadius: 0,
              fill: false
            },
            {
              type: 'line',
              label: 'MA(50)',
              data: ma50,
              yAxisID: 'y',
              borderColor: '#00bfff',
              borderWidth: 1.5,
              pointRadius: 0,
              fill: false
            },
            {
              type: 'bar',
              label: 'Volume',
              data: candles.map((c: any) => ({ x: c.x, y: c.v })),
              yAxisID: 'volume',
              backgroundColor: candles.map((c: any, i: number) => 
                i === 0 ? 'rgba(153, 153, 153, 0.3)' : 
                c.c >= candles[i-1].c ? 'rgba(0, 212, 170, 0.3)' : 'rgba(255, 107, 107, 0.3)'
              ),
              borderWidth: 0
            }
          ]
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setLoading(false);
      }
    };
    fetchData();

    return () => {
      // Cleanup chart on unmount
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [symbol]);

  return (
    <div className="chart-modal-overlay" onClick={onClose}>
      <div className="chart-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="chart-modal-header">
          <div>
            <h2>{symbol}</h2>
            {stats && (
              <div className="price-info">
                <span className="current-price">${stats.current.toFixed(2)}</span>
                <span className={`price-change ${stats.change >= 0 ? 'positive' : 'negative'}`}>
                  {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(2)} ({stats.changePercent >= 0 ? '+' : ''}{stats.changePercent.toFixed(2)}%)
                </span>
              </div>
            )}
            {dateRange && <p className="date-range">{dateRange}</p>}
          </div>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        {stats && (
          <div className="chart-stats">
            <div className="stat-item">
              <span className="stat-label">High</span>
              <span className="stat-value">${stats.high.toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Low</span>
              <span className="stat-value">${stats.low.toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Volume</span>
              <span className="stat-value">{(stats.volume / 1000000).toFixed(2)}M</span>
            </div>
            <div className="stat-item legend">
              <span className="legend-item"><span className="legend-color" style={{background: '#ffa500'}}></span>MA(20)</span>
              <span className="legend-item"><span className="legend-color" style={{background: '#00bfff'}}></span>MA(50)</span>
            </div>
          </div>
        )}
        <div className="chart-container">
          {loading ? (
            <div className="loading">Loading chart...</div>
          ) : chartData ? (
            <Chart 
              ref={chartRef}
              type="candlestick" 
              data={chartData} 
              options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: 'index',
                intersect: false
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.95)',
                  titleColor: '#00d4aa',
                  bodyColor: '#fff',
                  padding: 16,
                  displayColors: true,
                  callbacks: {
                    label: function(context: any) {
                      if (context.dataset.type === 'candlestick') {
                        const data = context.raw;
                        return [
                          `Open: $${data.o.toFixed(2)}`,
                          `High: $${data.h.toFixed(2)}`,
                          `Low: $${data.l.toFixed(2)}`,
                          `Close: $${data.c.toFixed(2)}`
                        ];
                      } else if (context.dataset.type === 'bar') {
                        return `Volume: ${(context.parsed.y / 1000000).toFixed(2)}M`;
                      } else {
                        return `${context.dataset.label}: $${context.parsed.y?.toFixed(2)}`;
                      }
                    }
                  }
                }
              },
              scales: {
                x: {
                  type: 'time',
                  time: { unit: 'day', displayFormats: { day: 'MMM dd' } },
                  grid: { color: '#2a2a2a' },
                  ticks: { color: '#a0a0a0', font: { size: 11 } }
                },
                y: {
                  position: 'right',
                  grid: { color: '#2a2a2a' },
                  ticks: { 
                    color: '#a0a0a0',
                    font: { size: 11 },
                    callback: function(value: any) {
                      return '$' + value.toFixed(0);
                    }
                  }
                },
                volume: {
                  type: 'linear',
                  position: 'right',
                  grid: { display: false },
                  ticks: { display: false }
                }
              }
            }} />
          ) : (
            <div className="error">Failed to load chart</div>
          )}
        </div>
      </div>
    </div>
  );
};

