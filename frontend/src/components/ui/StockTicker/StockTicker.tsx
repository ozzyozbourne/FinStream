import React from 'react';
import { StockTickerProps } from '../../../types';
import './StockTicker.css';

const StockTicker: React.FC<StockTickerProps> = ({ 
  ticker, 
  showChange = true, 
  className = '' 
}) => {
  const { symbol, price, change, changePercent } = ticker;
  const isPositive = change >= 0;

  const formatPrice = (price: number) => {
    return price.toFixed(2);
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
    <div className={`stock-ticker ${className}`}>
      <div className="stock-symbol">{symbol}</div>
      <div className="stock-price">${formatPrice(price)}</div>
      {showChange && (
        <div className={`stock-change ${isPositive ? 'positive' : 'negative'}`}>
          {formatChange(change)} ({formatChangePercent(changePercent)})
        </div>
      )}
    </div>
  );
};

export default StockTicker;
