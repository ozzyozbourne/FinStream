import React, { useEffect, useState, useMemo } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    Filler,
    ScriptableContext,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { connectLiveFinnhub } from "../../../services/finnhubLive";
import "./LiveChart.css";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    Filler
);

interface Props {
    symbol: string;
    onRemove?: (symbol: string) => void;
}

interface DataPoint {
    x: number; // timestamp
    y: number; // price
    v: number; // volume
}

const LiveChart: React.FC<Props> = ({ symbol, onRemove }) => {
    const [data, setData] = useState<DataPoint[]>([]);
    const [stats, setStats] = useState({ high: 0, low: Infinity, vol: 0 });

    // Connect to WebSocket & Fetch History
    useEffect(() => {
        let isMounted = true;

        // 1. Fetch Historical Data first (so we have something to show immediately)
        const fetchHistory = async () => {
            try {
                // Fetch last 1 day of 5-minute intervals
                const response = await fetch(`http://localhost:3001/api/yahoo/history?symbol=${symbol}&range=1d&interval=5m`);
                const history = await response.json();

                if (isMounted && Array.isArray(history) && history.length > 0) {
                    const formattedHistory = history.map((h: any) => ({
                        x: h.timestamp * 1000,
                        y: h.close,
                        v: h.volume
                    }));
                    setData(formattedHistory);

                    // Initialize stats from history
                    const prices = formattedHistory.map((d: any) => d.y);
                    setStats({
                        high: Math.max(...prices),
                        low: Math.min(...prices),
                        vol: formattedHistory.reduce((acc: number, curr: any) => acc + curr.v, 0)
                    });
                }
            } catch (err) {
                console.error("Failed to load history for", symbol, err);
            }
        };

        fetchHistory();

        // 2. Subscribe to Live Updates
        const ws = connectLiveFinnhub(symbol, (trade) => {
            if (trade.s === symbol) {
                const price = trade.p;
                const vol = trade.v || 0;
                const time = trade.t;

                setData((prev) => {
                    // Avoid duplicates if WS sends old data overlapping with history
                    const filteredPrev = prev.filter(d => d.x < time);
                    const newData = [...filteredPrev, { x: time, y: price, v: vol }];

                    // Sort by timestamp
                    newData.sort((a, b) => a.x - b.x);

                    // Keep reasonable history length (e.g. 500 points) to avoid memory leaks
                    return newData.slice(-500);
                });

                setStats((prev) => ({
                    high: Math.max(prev.high, price),
                    low: Math.min(prev.low, price),
                    vol: prev.vol + vol,
                }));
            }
        });

        return () => {
            isMounted = false;
            ws.close();
        };
    }, [symbol]);

    // Chart Configuration
    const chartData = useMemo(() => {
        return {
            datasets: [
                {
                    type: "line" as const,
                    label: "Price",
                    data: data.map((d) => ({ x: d.x, y: d.y })),
                    borderColor: "#00ffbf",
                    borderWidth: 2,
                    backgroundColor: "transparent",
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    tension: 0.05, // Sturdier lines
                    yAxisID: "y",
                },
                {
                    type: "bar" as const,
                    label: "Volume",
                    data: data.map((d) => ({ x: d.x, y: d.v })),
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    borderColor: "transparent",
                    barThickness: 4,
                    yAxisID: "y1",
                },
            ],
        };
    }, [data]);

    const options = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0, // Disable animation for performance with live updates
            },
            interaction: {
                mode: "index" as const,
                intersect: false,
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    enabled: true,
                    mode: "index" as const,
                    intersect: false,
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    titleColor: "#fff",
                    bodyColor: "#ccc",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderWidth: 1,
                },
            },
            scales: {
                x: {
                    type: "time" as const,
                    time: {
                        unit: "second" as const,
                        displayFormats: {
                            second: "h:mm:ss a",
                        },
                    },
                    grid: {
                        display: false,
                    },
                    ticks: {
                        color: "#666",
                        font: {
                            size: 10,
                        },
                        maxTicksLimit: 6,
                    },
                },
                y: {
                    type: "linear" as const,
                    display: true,
                    position: "right" as const,
                    beginAtZero: false, // Allow auto-scaling to zoom in on price action
                    grid: {
                        color: "rgba(255, 255, 255, 0.05)",
                    },
                    ticks: {
                        color: "#00ffbf",
                        font: {
                            size: 11,
                            family: "'Roboto Mono', monospace",
                        },
                        callback: (value: any) => value.toFixed(2), // Format price ticks
                    },
                },
                y1: {
                    type: "linear" as const,
                    display: true, // Show volume axis
                    position: "left" as const,
                    grid: {
                        display: false,
                    },
                    ticks: {
                        color: "#666",
                        font: {
                            size: 10,
                        },
                        maxTicksLimit: 5,
                        callback: (value: any) => (value / 1000).toFixed(0) + "K", // Format volume K
                    },
                    min: 0,
                    max: Math.max(...data.map((d) => d.v)) * 4 || 100, // Keep volume bars in bottom 1/4
                },
            },
        }),
        [data]
    );

    const currentPrice = data.length > 0 ? data[data.length - 1].y : 0;
    // Calculate change if we have at least 2 points, otherwise 0
    const startPrice = data.length > 0 ? data[0].y : 0;
    const change = currentPrice - startPrice;
    const changePercent = startPrice ? (change / startPrice) * 100 : 0;
    const isPositive = change >= 0;

    return (
        <div className="live-chart-container">
            <div className="chart-header">
                <div className="header-left">
                    <span className="chart-symbol">{symbol}</span>
                    <span className="live-badge">LIVE</span>
                </div>

                <div className="header-stats">
                    <div className="stat-group">
                        <span className={`current-price ${isPositive ? 'pos' : 'neg'}`}>
                            ${currentPrice.toFixed(2)}
                        </span>
                        <span className={`change-pill ${isPositive ? 'pos' : 'neg'}`}>
                            {isPositive ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
                        </span>
                    </div>

                    <div className="stat-row">
                        <div className="stat-item">
                            <span className="label">H:</span>
                            <span className="value">{stats.high !== -Infinity ? stats.high.toFixed(2) : '--'}</span>
                        </div>
                        <div className="stat-item">
                            <span className="label">L:</span>
                            <span className="value">{stats.low !== Infinity ? stats.low.toFixed(2) : '--'}</span>
                        </div>
                        <div className="stat-item">
                            <span className="label">Vol:</span>
                            <span className="value">{(stats.vol / 1000).toFixed(1)}K</span>
                        </div>
                    </div>
                </div>

                {onRemove && (
                    <button
                        className="remove-btn"
                        onClick={() => onRemove(symbol)}
                        title="Remove"
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="chart-wrapper">
                {data.length > 1 ? (
                    <Chart type="bar" data={chartData} options={options} />
                ) : (
                    <div className="loading-state">Waiting for data...</div>
                )}
            </div>
        </div>
    );
};

export default React.memo(LiveChart);
