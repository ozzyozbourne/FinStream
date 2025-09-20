import React from 'react';
import { mockTopGainers } from '../../../utils/mockData';
import StockTicker from '../../ui/StockTicker';
import './TopGainers.css';

const TopGainers: React.FC = () => {
  return (
    <div className="top-gainers">
      <h3 className="section-title">Top Gainers</h3>
      <div className="gainers-list">
        {mockTopGainers.map((stock, index) => (
          <div key={stock.symbol} className="gainer-item">
            <div className="gainer-rank">{index + 1}</div>
            <div className="gainer-info">
              <div className="gainer-name">
                <span className="gainer-symbol">{stock.symbol}</span>
                <span className="gainer-company">{stock.name}</span>
              </div>
              <StockTicker
                ticker={{
                  symbol: stock.symbol,
                  price: stock.price,
                  change: stock.change,
                  changePercent: stock.changePercent
                }}
                showChange={true}
                className="compact"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopGainers;
