import React, { useMemo } from 'react';
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler
);

interface PortfolioChartProps {
    data: { timestamp: number; value: number }[];
    isLoading?: boolean;
    minimal?: boolean;
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ data, isLoading, minimal = false }) => {

    // Prepare Chart Data
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return null;

        const labels = data.map(d => new Date(d.timestamp * 1000).toLocaleDateString());
        const values = data.map(d => d.value);
        const isPositive = values[values.length - 1] >= values[0];
        const lineColor = isPositive ? '#00d4aa' : '#ff4757';

        return {
            labels,
            datasets: [
                {
                    label: 'Portfolio Value',
                    data: values,
                    borderColor: lineColor,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    fill: true,
                    backgroundColor: (context: ScriptableContext<'line'>) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                        gradient.addColorStop(0, isPositive ? 'rgba(0, 212, 170, 0.2)' : 'rgba(255, 71, 87, 0.2)');
                        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                        return gradient;
                    },
                    tension: 0.1
                }
            ]
        };
    }, [data]);

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
                backgroundColor: '#1a1a1a',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#333',
                borderWidth: 1,
                callbacks: {
                    label: function (context: any) {
                        return new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                        }).format(context.parsed.y);
                    }
                }
            }
        },
        scales: {
            x: {
                display: false, // Hide X axis labels for cleaner look
                grid: {
                    display: false
                }
            },
            y: {
                display: true,
                position: 'right' as const,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                    color: '#666',
                    callback: function (value: any) {
                        return '$' + value.toLocaleString();
                    }
                }
            }
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false
        }
    };

    if (minimal) {
        options.plugins.tooltip.enabled = false;
        options.scales.x.display = false;
        options.scales.y.display = false;
        // @ts-ignore
        options.scales.x.grid.display = false;
        // @ts-ignore
        options.scales.y.grid.display = false;
        options.layout = { padding: 0 };
    }

    if (isLoading) {
        return (
            <div style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666'
            }}>
                Loading Chart...
            </div>
        );
    }

    if (!chartData) {
        return (
            <div style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666'
            }}>
                No Data Available
            </div>
        );
    }

    return <Line data={chartData} options={options} />;
};

export default PortfolioChart;
