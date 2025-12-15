import React, { useState } from "react";
import LiveChart from "../../components/ui/LiveChart/LiveChart";
import StockSearch from "../../components/ui/StockSearch/StockSearch";
import { Stock } from "../../types";
import "./LiveMarketsPage.css";

const LiveMarketsPage = () => {
  // Default symbols
  const [symbols, setSymbols] = useState<string[]>(["AAPL", "TSLA", "MSFT", "NVDA", "GOOGL"]);
  const [layout, setLayout] = useState<'grid' | 'compact' | 'vertical'>('grid');

  const handleAddSymbol = React.useCallback((stock: Stock) => {
    const symbol = stock.symbol;
    setSymbols(prev => {
      if (symbol && !prev.includes(symbol)) {
        return [symbol, ...prev];
      }
      return prev;
    });
  }, []);

  const handleRemoveSymbol = React.useCallback((symbolToRemove: string) => {
    setSymbols(prev => prev.filter(s => s !== symbolToRemove));
  }, []);

  return (
    <div className="live-markets-container">
      <div className="live-header-controls">
        <div>
          <h1>Live Markets</h1>
          <p style={{ margin: 0, opacity: 0.7 }}>Streaming real-time data from Finnhub</p>
        </div>

        <div className="layout-toggles">
          <button
            className={`layout-btn ${layout === 'grid' ? 'active' : ''}`}
            onClick={() => setLayout('grid')}
            title="Responsive Grid"
          >
            Grid
          </button>
          <button
            className={`layout-btn ${layout === 'compact' ? 'active' : ''}`}
            onClick={() => setLayout('compact')}
            title="2-Column Fixed (1x2)"
          >
            1x2
          </button>
          <button
            className={`layout-btn ${layout === 'vertical' ? 'active' : ''}`}
            onClick={() => setLayout('vertical')}
            title="Vertical List"
          >
            List
          </button>
        </div>

        <div className="search-container-live">
          <StockSearch
            placeholder="Add Symbol (e.g. AMZN)..."
            onSelect={handleAddSymbol}
          />
        </div>
      </div>

      <div className={`charts-grid layout-${layout}`}>
        {symbols.map(symbol => (
          <LiveChart
            key={symbol}
            symbol={symbol}
            onRemove={handleRemoveSymbol}
          />
        ))}
      </div>
    </div>
  );
};

export default LiveMarketsPage;
