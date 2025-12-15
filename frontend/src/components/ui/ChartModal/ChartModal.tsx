import React, { useEffect, useState, useRef } from 'react';
import { createChart, ColorType, IChartApi, CandlestickSeries, HistogramSeries, LineSeries, Time } from 'lightweight-charts';
import { stockDataService } from '../../../services/stockDataService';
import { yahooFinanceService } from '../../../services/yahooFinance';
import './ChartModal.css';

interface ChartModalProps {
  symbol: string;
  onClose: () => void;
}

export const ChartModal: React.FC<ChartModalProps> = ({ symbol, onClose }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Helper to calculate Moving Averages
  const calculateMA = (data: any[], period: number) => {
    const ma = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        // Not enough data points yet
        ma.push({ time: data[i].time, value: NaN });
      } else {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
        ma.push({ time: data[i].time, value: sum / period });
      }
    }
    // Filter out NaN values for clean line rendering where possible, or let lib handle it
    return ma.filter(d => !isNaN(d.value));
  };

  useEffect(() => {
    let activeChart: IChartApi | null = null;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [data, quote] = await Promise.all([
          stockDataService.getEODData(symbol),
          yahooFinanceService.getStockQuote(symbol)
        ]);

        if (!data || !data.data || data.data.length === 0) {
          throw new Error('No data available');
        }

        // Transform data
        // API returns date string, lightweight-charts prefers timestamp in seconds or YYYY-MM-DD string
        const candles = data.data.map((item: any) => ({
          time: item.date.split('T')[0], // Use YYYY-MM-DD string for daily data
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume
        })).sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());

        // Stats calculation
        let currentPrice = 0;
        let change = 0;
        let changePercent = 0;

        if (quote) {
          currentPrice = quote.price;
          change = quote.price - quote.previousClose;
          changePercent = (change / quote.previousClose) * 100;
        } else {
          // Fallback to last candle if quote fails
          const latest = candles[candles.length - 1];
          const previous = candles[candles.length - 2];
          currentPrice = latest.close;
          change = latest.close - previous.close;
          changePercent = (change / previous.close) * 100;
        }

        setStats({
          current: currentPrice,
          change: change,
          changePercent: changePercent,
          high: Math.max(...candles.map((c: any) => c.high)),
          low: Math.min(...candles.map((c: any) => c.low)),
          volume: candles[candles.length - 1].volume
        });

        if (chartContainerRef.current) {
          // Initialize Chart
          const chart = createChart(chartContainerRef.current, {
            layout: {
              background: { type: ColorType.Solid, color: '#1a1a1a' },
              textColor: '#d1d4dc',
            },
            grid: {
              vertLines: { color: 'rgba(42, 46, 57, 0.1)' },
              horzLines: { color: 'rgba(42, 46, 57, 0.1)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            timeScale: {
              borderColor: '#2B2B43',
              timeVisible: true,
            },
            rightPriceScale: {
              borderColor: '#2B2B43',
            },
            crosshair: {
              mode: 1, // CrosshairMode.Normal
              vertLine: {
                width: 1,
                color: 'rgba(224, 227, 235, 0.1)',
                style: 0,
              },
              horzLine: {
                width: 1,
                color: 'rgba(224, 227, 235, 0.1)',
                style: 0,
              },
            },
          });

          activeChart = chart;
          chartRef.current = chart;

          // Candlestick Series
          const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#00d4aa',
            downColor: '#ff6b6b',
            borderVisible: false,
            wickUpColor: '#00d4aa',
            wickDownColor: '#ff6b6b',
          });
          candlestickSeries.setData(candles);

          // Moving Averages
          const ma20Data = calculateMA(candles, 20);
          const ma50Data = calculateMA(candles, 50);

          const ma20Series = chart.addSeries(LineSeries, {
            color: '#ffa500',
            lineWidth: 1,
            title: 'MA 20',
          });
          ma20Series.setData(ma20Data);

          const ma50Series = chart.addSeries(LineSeries, {
            color: '#00bfff',
            lineWidth: 1,
            title: 'MA 50',
          });
          ma50Series.setData(ma50Data);

          // Volume Series
          const volumeSeries = chart.addSeries(HistogramSeries, {
            color: '#26a69a',
            priceFormat: {
              type: 'volume',
            },
            priceScaleId: '', // Set as an overlay
          });

          volumeSeries.priceScale().applyOptions({
            scaleMargins: {
              top: 0.8, // Separate volume from main chart
              bottom: 0,
            },
          });

          const volumeData = candles.map((c: any, i: number) => ({
            time: c.time,
            value: c.volume,
            color: (i > 0 && c.close < candles[i - 1].close) ? 'rgba(255, 107, 107, 0.5)' : 'rgba(0, 212, 170, 0.5)',
          }));
          volumeSeries.setData(volumeData);

          chart.timeScale().fitContent();
        }
        setLoading(false);
      } catch (err: any) {
        console.error("Chart load error:", err);
        setError("Failed to load chart data");
        setLoading(false);
      }
    };

    fetchData();

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (activeChart) {
        activeChart.remove();
      }
    };
  }, [symbol]);

  return (
    <div className="chart-modal-overlay" onClick={onClose}>
      <div className="chart-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="chart-modal-header">
          <div className="header-info">
            <h2>{symbol}</h2>
            {stats && (
              <div className="price-info">
                <span className="current-price">${stats.current.toFixed(2)}</span>
                <span className={`price-change ${stats.change >= 0 ? 'positive' : 'negative'}`}>
                  {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(2)} ({stats.changePercent >= 0 ? '+' : ''}{stats.changePercent.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        {stats && (
          <div className="chart-stats-bar">
            <div className="stat-pill">H: <span>${stats.high.toFixed(2)}</span></div>
            <div className="stat-pill">L: <span>${stats.low.toFixed(2)}</span></div>
            <div className="stat-pill">Vol: <span>{(stats.volume / 1000000).toFixed(2)}M</span></div>
            <div className="stat-pill legend-ma"><span style={{ background: '#ffa500' }}></span>MA20</div>
            <div className="stat-pill legend-ma"><span style={{ background: '#00bfff' }}></span>MA50</div>
          </div>
        )}

        <div className="chart-container-wrapper">
          {loading && <div className="chart-loading">Loading chart data...</div>}
          {error && <div className="chart-error">{error}</div>}
          <div ref={chartContainerRef} className="tradingview-chart-container" />
        </div>
      </div>
    </div>
  );
};

