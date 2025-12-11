import React, { useEffect, useState, useRef } from 'react';
import { mockTopGainers } from '../../../utils/mockData';
import StockTicker from '../../ui/StockTicker';
import { Stock } from '../../../types';
import './TopGainers.css';

const WS_URL = 'ws://localhost:3001';

const TopGainers: React.FC = () => {
  const [gainers, setGainers] = useState<Stock[]>(mockTopGainers);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'top_gainers' && message.data) {
          // Determine animation/color change if necessary, for now just update data
          setGainers(message.data);
        }
      } catch (e) {
        console.error(e);
      }
    }

    return () => {
      ws.current?.close();
    }
  }, []);

  return (
    <div className="top-gainers">
      <h3 className="section-title">Top Gainers</h3>
      <div className="gainers-list">
        {gainers.map((stock, index) => (
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
