import React from 'react';
import { mockMarketIndices } from '../../../utils/mockData';
import MarketIndex from '../../ui/MarketIndex';
import SearchBar from '../../ui/SearchBar';
import './MarketSummary.css';

const MarketSummary: React.FC = () => {
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
          <span className="status-indicator closed"></span>
          <span className="status-text">Markets closed.</span>
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
        {mockMarketIndices.map((index) => (
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
            <polyline points="15,18 9,12 15,6"/>
          </svg>
        </button>
        <button className="nav-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MarketSummary;
