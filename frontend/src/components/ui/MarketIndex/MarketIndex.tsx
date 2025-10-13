import React from 'react';
import { MarketIndexProps } from '../../../types';
import SparklineChart from '../SparklineChart';
import './MarketIndex.css';

const MarketIndex: React.FC<MarketIndexProps> = ({ index, onClick }) => {
  const { name, value, change, changePercent, sparklineData } = index;
  const isPositive = change >= 0;

  const formatValue = (value: number) => {
    return value.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  const formatChangePercent = (changePercent: number) => {
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
  };

  return (
    <div className={`market-index ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      <div className="index-header">
        <span className="index-name">{name}</span>
        <span className="index-value">{formatValue(value)}</span>
      </div>
      <div className="index-change-container">
        <div className={`index-change ${isPositive ? 'positive' : 'negative'}`}>
          {formatChange(change)} ({formatChangePercent(changePercent)})
        </div>
        <SparklineChart 
          data={sparklineData} 
          isPositive={isPositive}
          className="index-sparkline"
        />
      </div>
    </div>
  );
};

export default MarketIndex;
