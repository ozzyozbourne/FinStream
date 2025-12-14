
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, CandlestickSeries } from 'lightweight-charts';
import { Stock } from '../../types';
import { yahooService } from '../../services/yahooService';

interface WatchlistCandleChartProps {
    stock: Stock;
    height?: number;
}

const WatchlistCandleChart: React.FC<WatchlistCandleChartProps> = ({ stock, height = 300 }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Initialize Chart
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.2)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.2)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: height,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: '#2B2B43',
            },
            rightPriceScale: {
                borderColor: '#2B2B43',
            },
        });
        chartRef.current = chart;

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#00d4aa',
            downColor: '#ff6b6b',
            borderVisible: false,
            wickUpColor: '#00d4aa',
            wickDownColor: '#ff6b6b',
        });

        // Fetch Data
        const loadData = async () => {
            setIsLoading(true);
            const history = await yahooService.getStockHistory(stock.symbol, '1d', '5m');
            if (history && history.length > 0) {
                // Convert to lightweight-charts format (timestamp requires seconds for Time)
                const chartData = history.map(h => ({
                    time: (h.timestamp / 1000) as any, // Unix timestamp in seconds
                    open: h.open,
                    high: h.high,
                    low: h.low,
                    close: h.close,
                }));

                // Sort by time just in case
                chartData.sort((a, b) => (a.time as number) - (b.time as number));

                candlestickSeries.setData(chartData);
                chart.timeScale().fitContent();
            }
            setIsLoading(false);
        };

        loadData();

        // Resize Observer
        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [stock.symbol, height]);

    return (
        <div style={{ position: 'relative', width: '100%', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden', background: '#1a1a1a' }}>
            {isLoading && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: 'rgba(0,0,0,0.5)' }}>
                    <span style={{ color: '#888', fontSize: '0.9rem' }}>Loading Chart...</span>
                </div>
            )}
            <div ref={chartContainerRef} style={{ width: '100%' }} />
        </div>
    );
};

export default WatchlistCandleChart;
