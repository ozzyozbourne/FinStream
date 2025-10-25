import React, { useState, useEffect } from 'react';
import { polygonService } from '../../services/polygonService';
import MarketIndex from '../../components/ui/MarketIndex';
import StockTicker from '../../components/ui/StockTicker';
import SparklineChart from '../../components/ui/SparklineChart';
import SearchBar from '../../components/ui/SearchBar';
import Button from '../../components/ui/Button';
import './MarketsPage.css';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high52Week?: number;
  low52Week?: number;
  sparklineData?: number[];
}

interface MarketIndexData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

const MarketsPage: React.FC = () => {
  const [marketIndices, setMarketIndices] = useState<MarketIndexData[]>([]);
  const [topGainers, setTopGainers] = useState<MarketData[]>([]);
  const [topLosers, setTopLosers] = useState<MarketData[]>([]);
  const [mostActive, setMostActive] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MarketData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTab, setSelectedTab] = useState('indices');

  const tabs = [
    { id: 'indices', label: 'Market Indices' },
    { id: 'gainers', label: 'Top Gainers' },
    { id: 'losers', label: 'Top Losers' },
    { id: 'active', label: 'Most Active' }
  ];

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    try {
      setIsLoading(true);

      // Mock market indices data
      const mockIndices: MarketIndexData[] = [
        {
          symbol: 'SPX',
          name: 'S&P 500',
          price: 4567.89,
          change: 23.45,
          changePercent: 0.52,
          volume: 2500000000
        },
        {
          symbol: 'DJI',
          name: 'Dow Jones',
          price: 34567.89,
          change: -123.45,
          changePercent: -0.36,
          volume: 1800000000
        },
        {
          symbol: 'IXIC',
          name: 'NASDAQ',
          price: 14567.89,
          change: 89.12,
          changePercent: 0.62,
          volume: 3200000000
        },
        {
          symbol: 'RUT',
          name: 'Russell 2000',
          price: 1987.65,
          change: 12.34,
          changePercent: 0.62,
          volume: 450000000
        }
      ];

      // Mock top gainers data
      const mockGainers: MarketData[] = [
        {
          symbol: 'NVDA',
          name: 'NVIDIA Corporation',
          price: 485.67,
          change: 45.23,
          changePercent: 10.28,
          volume: 45000000,
          marketCap: 1200000000000,
          high52Week: 502.30,
          low52Week: 180.50,
          sparklineData: [440, 445, 450, 460, 470, 475, 480, 485]
        },
        {
          symbol: 'AMD',
          name: 'Advanced Micro Devices',
          price: 145.89,
          change: 12.45,
          changePercent: 9.33,
          volume: 32000000,
          marketCap: 235000000000,
          high52Week: 164.46,
          low52Week: 78.20,
          sparklineData: [133, 135, 138, 140, 142, 144, 145, 146]
        },
        {
          symbol: 'TSLA',
          name: 'Tesla, Inc.',
          price: 267.45,
          change: 18.90,
          changePercent: 7.60,
          volume: 85000000,
          marketCap: 850000000000,
          high52Week: 299.29,
          low52Week: 138.80,
          sparklineData: [248, 250, 255, 260, 262, 265, 266, 267]
        }
      ];

      // Mock top losers data
      const mockLosers: MarketData[] = [
        {
          symbol: 'META',
          name: 'Meta Platforms, Inc.',
          price: 312.45,
          change: -25.67,
          changePercent: -7.59,
          volume: 28000000,
          marketCap: 790000000000,
          high52Week: 384.33,
          low52Week: 88.09,
          sparklineData: [338, 335, 330, 325, 320, 315, 313, 312]
        },
        {
          symbol: 'NFLX',
          name: 'Netflix, Inc.',
          price: 445.67,
          change: -28.90,
          changePercent: -6.09,
          volume: 15000000,
          marketCap: 195000000000,
          high52Week: 485.00,
          low52Week: 285.00,
          sparklineData: [474, 470, 465, 460, 455, 450, 447, 446]
        }
      ];

      // Mock most active data
      const mockActive: MarketData[] = [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          price: 189.45,
          change: 2.34,
          changePercent: 1.25,
          volume: 65000000,
          marketCap: 2950000000000,
          high52Week: 198.23,
          low52Week: 124.17,
          sparklineData: [187, 188, 189, 190, 191, 190, 189, 189]
        },
        {
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          price: 378.90,
          change: -1.23,
          changePercent: -0.32,
          volume: 42000000,
          marketCap: 2810000000000,
          high52Week: 384.30,
          low52Week: 309.45,
          sparklineData: [380, 379, 378, 377, 378, 379, 378, 379]
        }
      ];

      setMarketIndices(mockIndices);
      setTopGainers(mockGainers);
      setTopLosers(mockLosers);
      setMostActive(mockActive);

    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      try {
        // Mock search results
        const mockResults: MarketData[] = [
          {
            symbol: query.toUpperCase(),
            name: `${query.toUpperCase()} Corporation`,
            price: Math.random() * 500 + 50,
            change: (Math.random() - 0.5) * 20,
            changePercent: (Math.random() - 0.5) * 10,
            volume: Math.floor(Math.random() * 10000000),
            marketCap: Math.floor(Math.random() * 1000000000000),
            sparklineData: Array.from({ length: 8 }, () => Math.random() * 100 + 200)
          }
        ];
        setSearchResults(mockResults);
      } catch (error) {
        console.error('Error searching stocks:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const getCurrentData = () => {
    switch (selectedTab) {
      case 'indices':
        return marketIndices;
      case 'gainers':
        return topGainers;
      case 'losers':
        return topLosers;
      case 'active':
        return mostActive;
      default:
        return [];
    }
  };

  const renderMarketCard = (item: MarketData | MarketIndexData, index: number) => (
    <div key={`${item.symbol}-${index}`} className="market-card">
      <div className="market-card-header">
        <div className="stock-info">
          <h3 className="stock-symbol">{item.symbol}</h3>
          <p className="stock-name">{item.name}</p>
        </div>
        <div className="price-info">
          <span className="stock-price">${item.price.toFixed(2)}</span>
          <div className={`price-change ${item.change >= 0 ? 'positive' : 'negative'}`}>
            <span>{item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}</span>
            <span>({item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)</span>
          </div>
        </div>
      </div>
      
      {('sparklineData' in item && item.sparklineData) && (
        <div className="sparkline-container">
          <SparklineChart data={item.sparklineData} />
        </div>
      )}
      
      <div className="market-card-footer">
        <div className="volume-info">
          <span>Volume: {item.volume.toLocaleString()}</span>
        </div>
        {('marketCap' in item && item.marketCap) && (
          <div className="market-cap">
            <span>Market Cap: ${(item.marketCap / 1000000000).toFixed(1)}B</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="markets-page">
      <div className="markets-header">
        <h1 className="markets-title">Markets</h1>
        <p className="markets-subtitle">Real-time market data and analysis</p>
      </div>

      <div className="markets-controls">
        <div className="search-section">
          <SearchBar
            placeholder="Search stocks, indices, or ETFs..."
            onSearch={handleSearch}
            className="markets-search"
          />
        </div>

        <div className="tabs-container">
          {tabs.map(tab => (
            <Button
              key={tab.id}
              variant={selectedTab === tab.id ? 'primary' : 'outline'}
              size="small"
              onClick={() => setSelectedTab(tab.id)}
              className="tab-button"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="markets-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading market data...</p>
          </div>
        ) : (
          <>
            {searchQuery && (
              <div className="search-results">
                <h2>Search Results for "{searchQuery}"</h2>
                <div className="market-grid">
                  {isSearching ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    searchResults.map((result, index) => renderMarketCard(result, index))
                  )}
                </div>
              </div>
            )}

            <div className="market-section">
              <h2 className="section-title">
                {tabs.find(tab => tab.id === selectedTab)?.label}
              </h2>
              <div className="market-grid">
                {getCurrentData().map((item, index) => renderMarketCard(item, index))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MarketsPage;
