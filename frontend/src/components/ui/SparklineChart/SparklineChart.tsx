import React from 'react';
import './SparklineChart.css';

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  isPositive?: boolean;
}

const SparklineChart: React.FC<SparklineChartProps> = ({ 
  data, 
  width = 60, 
  height = 20, 
  className = '',
  isPositive = true
}) => {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const pathData = `M ${points}`;

  return (
    <div className={`sparkline-chart ${className}`}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <path
          d={pathData}
          fill="none"
          stroke={isPositive ? '#00d4aa' : '#ff4757'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default SparklineChart;
