import React, { useEffect, useState, useRef } from 'react';
import { mockMarketIndices } from '../../../utils/mockData';
import MarketIndex from '../../ui/MarketIndex';
import SearchBar from '../../ui/SearchBar';
import { MarketIndex as MarketIndexType } from '../../../types';
import './MarketSummary.css';

const WS_URL = 'ws://localhost:3001';

const MarketSummary: React.FC = () => {
  const [indices, setIndices] = useState<MarketIndexType[]>(mockMarketIndices);
  const [marketStatus, setMarketStatus] = useState<string>('Checking market status...');
  const [isMarketOpen, setIsMarketOpen] = useState<boolean>(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const checkMarketStatus = () => {
      const now = new Date();

      // Convert to New York time (EST/EDT)
      const nyTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
      const day = nyTime.getDay(); // 0 is Sunday, 6 is Saturday
      const hour = nyTime.getHours();
      const minute = nyTime.getMinutes();

      // Market hours: Monday (1) to Friday (5), 9:30 AM to 4:00 PM (16:00)
      const isWeekday = day >= 1 && day <= 5;
      const isTradingHours = (hour > 9 || (hour === 9 && minute >= 30)) && hour < 16;

      if (isWeekday && isTradingHours) {
        setMarketStatus('U.S. markets open');
        setIsMarketOpen(true);
      } else {
        setMarketStatus('U.S. markets closed');
        setIsMarketOpen(false);
      }
    };

    checkMarketStatus(); // Check immediately
    const interval = setInterval(checkMarketStatus, 60000); // Update every minute

    ws.current = new WebSocket(WS_URL);

    return () => {
      clearInterval(interval);
      ws.current?.close();
    }
  }, []);

  // ... (rest of websocket logic remains in separate effect or needs merging if in same effect)
  // Re-organizing effects to be cleaner
  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log('Connected to WS');
      // Subscribe to indices (using internal IDs which backend maps to symbols)
      const symbolsToSubscribe = ['sp500', 'dow30', 'nasdaq', 'russell2000', 'vix', 'gold'];
      symbolsToSubscribe.forEach(symbol => {
        ws.current?.send(JSON.stringify({ type: 'subscribe', symbol }));
      });
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'trade' && message.data) {
          message.data.forEach((trade: any) => {
            // Backend provides internalId (e.g., 'sp500') mapped from ticker (e.g., 'SPY')
            if (trade.internalId) {
              setIndices(prevIndices => prevIndices.map(index => {
                if (index.id === trade.internalId) {
                  const currentPrice = trade.p;
                  return {
                    ...index,
                    value: currentPrice,
                  };
                }
                return index;
              }));
            }
          });
        }
      } catch (error) {
        console.error('Error parsing WS message', error);
      }
    };

    return () => {
      ws.current?.close();
    };
  }, []);


  const handleQuoteSearch = (query: string) => {
    console.log('Quote search:', query);
    // INDEX INDEX AAKASH WILL SEND. 
  };

  const handleIndexClick = (indexId: string) => {
    console.log('Index clicked:', indexId);
    // TODO: Implement index details navigation
  };

  return (
    <div className="market-summary">
      <div className="market-summary-header">
        <h2 className="section-title">Market Summary</h2>
        <div className="market-status">
          <span className={`status-indicator ${isMarketOpen ? 'open' : 'closed'}`}></span>
          <span className="status-text">{marketStatus}</span>
        </div>
      </div>

      <div className="quote-lookup">
        <SearchBar
          placeholder="Q Quote Lookup"
          onSearch={handleQuoteSearch}
          className="quote-search"
        />
      </div>

      <div className="market-indices">
        {indices.map((index) => (
          <MarketIndex
            key={index.id}
            index={index}
            onClick={() => handleIndexClick(index.id)}
          />
        ))}
      </div>

      <div className="market-navigation">
        <button className="nav-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>
        <button className="nav-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MarketSummary;
