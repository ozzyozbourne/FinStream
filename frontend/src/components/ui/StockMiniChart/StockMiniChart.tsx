import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    ScriptableContext
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Stock } from '../../../types';
import { yahooService } from '../../../services/yahooService';
import './StockMiniChart.css';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler
);

interface StockMiniChartProps {
    stock: Stock;
}

type ViewType = 'trend' | 'change' | 'momentum' | 'risk';

const StockMiniChart: React.FC<StockMiniChartProps> = ({ stock }) => {
    const [view, setView] = useState<ViewType>('trend');
    const [dataPoints, setDataPoints] = useState<number[]>([]);
    const [dataLabels, setDataLabels] = useState<string[]>([]);

    const isPositive = stock.change >= 0;
    const color = isPositive ? '#00d4aa' : '#ff6b6b';

    // Fetch real intraday data
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Fetch 1 day of data with 5 minute intervals
                const history = await yahooService.getStockHistory(stock.symbol, '1d', '5m');

                if (history && history.length > 0) {
                    const points = history.map(h => h.price);

                    // Format time labels (e.g., "9:30 AM")
                    const labels = history.map(h => {
                        const date = new Date(h.timestamp);
                        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                    });

                    setDataPoints(points);
                    setDataLabels(labels);
                }
            } catch (err) {
                console.error('Failed to load chart data', err);
            }
        };

        fetchHistory();

        // Refresh chart data every 30 seconds
        const intervalId = setInterval(fetchHistory, 30000);

        return () => clearInterval(intervalId);
    }, [stock.symbol]);

    // --- Views ---

    // 1. Trend View (Sparkline)
    const renderTrend = () => {
        const data = {
            labels: dataLabels,
            datasets: [
                {
                    fill: true,
                    data: dataPoints,
                    borderColor: color,
                    borderWidth: 2,
                    pointRadius: (ctx: ScriptableContext<'line'>) => {
                        // Only show dot at the end
                        return ctx.dataIndex === dataPoints.length - 1 ? 4 : 0;
                    },
                    pointBackgroundColor: color,
                    backgroundColor: (context: ScriptableContext<'line'>) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 60);
                        gradient.addColorStop(0, isPositive ? 'rgba(0, 212, 170, 0.2)' : 'rgba(255, 107, 107, 0.2)');
                        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                        return gradient;
                    },
                    tension: 0.4,
                },
            ],
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
            },
            scales: {
                x: {
                    display: true,
                    grid: { display: false },
                    ticks: {
                        color: '#666',
                        font: { size: 9 },
                        maxTicksLimit: 6,
                        maxRotation: 0
                    }
                },
                y: {
                    display: true,
                    position: 'right' as const,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false,
                    },
                    ticks: {
                        color: '#666',
                        font: { size: 9 },
                        maxTicksLimit: 4,
                        callback: function (value: any) {
                            return parseFloat(value).toFixed(2);
                        }
                    },
                    min: Math.min(...dataPoints) * 0.999,
                    max: Math.max(...dataPoints) * 1.001
                },
            },
            animation: { duration: 0 } as any, // Disable animation for updates to feel "instant" or keep smooth if preferred
        };

        return (
            <div className="trend-chart-wrapper">
                <Line data={data} options={options} />
            </div>
        );
    };

    // 2. Change View
    const renderChange = () => {
        const maxRange = 5; // e.g. +/- 5% is the full bar width
        const percent = Math.min(Math.abs(stock.changePercent), maxRange);
        const widthPercent = (percent / maxRange) * 50; // max 50% width from center

        return (
            <div className="change-view">
                <div className="change-bar-container">
                    <div className="change-zero-line"></div>
                    <div
                        className={`change-bar-fill ${isPositive ? 'positive' : 'negative'}`}
                        style={{ width: `${widthPercent}%` }}
                    ></div>
                    <span
                        className="change-label"
                        style={isPositive ? { left: 'calc(50% + 8px)' } : { right: 'calc(50% + 8px)' }}
                    >
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                </div>
            </div>
        );
    };

    // 3. Momentum View
    const renderMomentum = () => {
        // Basic logic: 0-1% Neutral, 1-3% Bull/Bear, >3% Strong
        const absChange = Math.abs(stock.changePercent);
        let strength = 'Neutral';
        let activeBlocks = 1; // 1 to 5

        if (absChange < 0.5) { strength = 'Neutral'; activeBlocks = 3; } // Center
        else if (isPositive) {
            if (absChange < 2.0) { strength = 'Bullish'; activeBlocks = 4; }
            else { strength = 'Strong Bullish'; activeBlocks = 5; }
        } else {
            if (absChange < 2.0) { strength = 'Bearish'; activeBlocks = 2; }
            else { strength = 'Strong Bearish'; activeBlocks = 1; }
        }

        // Colors for blocks: 1,2=Red, 3=Grey, 4,5=Green
        const getBlockColor = (index: number) => {
            if (index === 3) return '#333'; // Active center?
            if (index < 3) return '#ff6b6b';
            return '#00d4aa';
        };

        // Helper to dim inactive blocks
        const getOpacity = (index: number) => {
            // Simple logic: if activeBlocks == index, full opacity. 
            // Or if stronger.
            if (activeBlocks === 3 && index === 3) return 1; // Neutral
            if (activeBlocks > 3 && index > 3 && index <= activeBlocks) return 1;
            if (activeBlocks < 3 && index < 3 && index >= activeBlocks) return 1;

            // Always show the "level" attained
            if (isPositive && index > 3 && index <= activeBlocks) return 1;
            if (!isPositive && index < 3 && index >= activeBlocks) return 1;

            if (index === 3) return 0.5; // Center always faintly visible

            return 0.2;
        };

        return (
            <div className="momentum-view">
                <div className="momentum-meter">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div
                            key={i}
                            className="momentum-block"
                            style={{
                                backgroundColor: i === 3 ? '#666' : (i < 3 ? '#ff6b6b' : '#00d4aa'),
                                opacity: getOpacity(i),
                                boxShadow: getOpacity(i) === 1 ? `0 0 6px ${i === 3 ? '#666' : (i < 3 ? '#ff6b6b' : '#00d4aa')}` : 'none'
                            }}
                        ></div>
                    ))}
                </div>
                <span className="momentum-label" style={{ color: isPositive ? '#00d4aa' : (stock.changePercent < -0.5 ? '#ff6b6b' : '#ccc') }}>
                    {strength}
                </span>
            </div>
        );
    };

    // 4. Risk View
    const renderRisk = () => {
        const absChange = Math.abs(stock.changePercent);
        let riskLevel = 'Low';
        let riskClass = 'low';

        if (absChange > 5.0) { riskLevel = 'High'; riskClass = 'high'; }
        else if (absChange > 2.0) { riskLevel = 'Medium'; riskClass = 'medium'; }

        return (
            <div className="risk-view">
                <div className={`risk-badge ${riskClass}`}>
                    {riskLevel}
                </div>
                <span className="risk-desc">Volatility</span>
            </div>
        );
    };

    return (
        <div className="stock-mini-chart">
            <div className="mini-chart-header">
                <button
                    className={`view-toggle-btn ${view === 'trend' ? 'active' : ''} ${!isPositive && view === 'trend' ? 'negative-trend' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setView('trend'); }}
                >
                    Trend
                </button>
                <button
                    className={`view-toggle-btn ${view === 'change' ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setView('change'); }}
                >
                    Change
                </button>
                <button
                    className={`view-toggle-btn ${view === 'momentum' ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setView('momentum'); }}
                >
                    Momentum
                </button>
                <button
                    className={`view-toggle-btn ${view === 'risk' ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setView('risk'); }}
                >
                    Risk
                </button>
            </div>

            <div className="mini-chart-content">
                {view === 'trend' && renderTrend()}
                {view === 'change' && renderChange()}
                {view === 'momentum' && renderMomentum()}
                {view === 'risk' && renderRisk()}
            </div>
        </div>
    );
};

export default StockMiniChart;
