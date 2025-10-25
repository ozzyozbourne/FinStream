import React, { useState, useEffect } from 'react';
import { polygonService } from '../../services/polygonService';
import StockTicker from '../../components/ui/StockTicker';
import MarketIndex from '../../components/ui/MarketIndex';
import SparklineChart from '../../components/ui/SparklineChart';
import './WatchPage.css';

// Market Overview Component with Real Data
const MarketOverview: React.FC = () => {
  const [indices, setIndices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMarketIndices();
  }, []);

  const loadMarketIndices = async () => {
    try {
      setIsLoading(true);
      
      // Get real market indices data from Polygon.io
      const indicesData = await polygonService.getMarketIndices();
      
      if (indicesData && indicesData.length > 0) {
        setIndices(indicesData);
      } else {
        // Fallback to mock data if API fails
        setIndices([
          {
            id: 'SPX',
            name: 'S&P 500',
            value: 4567.89,
            change: 23.45,
            changePercent: 0.52,
            sparklineData: Array.from({ length: 20 }, () => Math.random() * 100 + 4500)
          },
          {
            id: 'DJI',
            name: 'Dow Jones',
            value: 34567.89,
            change: -123.45,
            changePercent: -0.36,
            sparklineData: Array.from({ length: 20 }, () => Math.random() * 200 + 34000)
          },
          {
            id: 'IXIC',
            name: 'NASDAQ',
            value: 14567.89,
            change: 89.12,
            changePercent: 0.62,
            sparklineData: Array.from({ length: 20 }, () => Math.random() * 100 + 14400)
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading market indices:', error);
      // Fallback to mock data
      setIndices([
        {
          id: 'SPX',
          name: 'S&P 500',
          value: 4567.89,
          change: 23.45,
          changePercent: 0.52,
          sparklineData: Array.from({ length: 20 }, () => Math.random() * 100 + 4500)
        },
        {
          id: 'DJI',
          name: 'Dow Jones',
          value: 34567.89,
          change: -123.45,
          changePercent: -0.36,
          sparklineData: Array.from({ length: 20 }, () => Math.random() * 200 + 34000)
        },
        {
          id: 'IXIC',
          name: 'NASDAQ',
          value: 14567.89,
          change: 89.12,
          changePercent: 0.62,
          sparklineData: Array.from({ length: 20 }, () => Math.random() * 100 + 14400)
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="market-overview">
        <h2>Market Overview</h2>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="market-overview">
      <h2>Market Overview</h2>
      <div className="indices-grid">
        {indices.map((index) => (
          <MarketIndex
            key={index.id}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

interface LiveMarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  lastUpdate: string;
  sparklineData: number[];
}

const WatchPage: React.FC = () => {
  const [marketData, setMarketData] = useState<LiveMarketData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [isMarketOpen, setIsMarketOpen] = useState(true);
  const [marketStatus, setMarketStatus] = useState('Live');

  const timeframes = ['1D', '5D', '1M', '3M', '6M', '1Y'];

  // Check if US market is open (9:30 AM - 4:00 PM ET, Monday-Friday)
  const checkMarketHours = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const et = new Date(utc + (-5 * 3600000)); // EST/EDT (simplified)
    
    const day = et.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = et.getHours();
    const minute = et.getMinutes();
    const timeInMinutes = hour * 60 + minute;
    
    // Market hours: 9:30 AM - 4:00 PM ET, Monday-Friday
    const marketOpen = 9 * 60 + 30; // 9:30 AM
    const marketClose = 16 * 60; // 4:00 PM
    
    const isWeekday = day >= 1 && day <= 5;
    const isMarketHours = timeInMinutes >= marketOpen && timeInMinutes < marketClose;
    
    return isWeekday && isMarketHours;
  };

  useEffect(() => {
    const marketOpen = checkMarketHours();
    setIsMarketOpen(marketOpen);
    setMarketStatus(marketOpen ? 'Live' : 'Closed');
    
    initializeLiveData();
    return () => {
      polygonService.disconnectWebSocket();
    };
  }, []);

  const initializeLiveData = async () => {
    try {
      // Popular stocks to track
      const stockSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'];
      const marketOpen = checkMarketHours();
      
      // Load real data from Polygon.io
      const realData: LiveMarketData[] = [];
      
      for (const symbol of stockSymbols) {
        try {
          // Get stock details
          const stockDetails = await polygonService.getStockDetails(symbol);
          
          // Get recent aggregates for sparkline (more days if market is closed)
          const daysToFetch = marketOpen ? 20 : 30; // More historical data when market is closed
          const aggregates = await polygonService.getStockAggregates(symbol, 'day', daysToFetch);
          
          if (stockDetails && aggregates && aggregates.length > 0) {
            const latest = aggregates[aggregates.length - 1];
            const previous = aggregates[aggregates.length - 2] || latest;
            
            const change = latest.close - previous.close;
            const changePercent = (change / previous.close) * 100;
            
            // Format last update time based on market status
            const lastUpdateTime = marketOpen 
              ? new Date().toISOString() 
              : new Date(latest.timestamp || Date.now()).toISOString();
            
            realData.push({
              symbol: symbol,
              name: stockDetails.name || `${symbol} Corporation`,
              price: latest.close,
              change: change,
              changePercent: changePercent,
              volume: latest.volume,
              lastUpdate: lastUpdateTime,
              sparklineData: aggregates.map((agg: any) => agg.close)
            });
          }
        } catch (error) {
          console.error(`Error loading data for ${symbol}:`, error);
          // Fallback to mock data for this symbol
          realData.push({
            symbol: symbol,
            name: `${symbol} Corporation`,
            price: Math.random() * 500 + 50,
            change: (Math.random() - 0.5) * 20,
            changePercent: (Math.random() - 0.5) * 10,
            volume: Math.floor(Math.random() * 10000000),
            lastUpdate: new Date().toISOString(),
            sparklineData: Array.from({ length: 20 }, () => Math.random() * 100 + 200)
          });
        }
      }

      setMarketData(realData);
      setIsConnected(true);
      setLastUpdate(new Date().toLocaleTimeString());

      // Only set up real-time updates if market is open
      if (marketOpen) {
        // Set up WebSocket for real-time updates
        try {
          polygonService.connectWebSocket((symbol: string, price: number, change: number, changePercent: number) => {
            setMarketData(prevData => 
              prevData.map(stock => 
                stock.symbol === symbol 
                  ? {
                      ...stock,
                      price: price,
                      change: change,
                      changePercent: changePercent,
                      lastUpdate: new Date().toISOString(),
                      sparklineData: [...stock.sparklineData.slice(1), price]
                    }
                  : stock
              )
            );
            setLastUpdate(new Date().toLocaleTimeString());
          });

          // Subscribe to all stocks for real-time updates
          stockSymbols.forEach(symbol => {
            polygonService.subscribeToStock(symbol);
          });
        } catch (wsError) {
          console.log('WebSocket connection failed, using polling instead:', wsError);
          
          // Fallback to polling every 30 seconds during market hours
          const updateInterval = setInterval(async () => {
            try {
              const updatedData = await Promise.all(
                stockSymbols.map(async (symbol) => {
                  try {
                    const aggregates = await polygonService.getStockAggregates(symbol, 'day', 1);
                    if (aggregates && aggregates.length > 0) {
                      const latest = aggregates[0];
                      return {
                        symbol,
                        price: latest.close,
                        volume: latest.volume,
                        lastUpdate: new Date().toISOString()
                      };
                    }
                  } catch (error) {
                    console.error(`Error updating ${symbol}:`, error);
                  }
                  return null;
                })
              );

              setMarketData(prevData => 
                prevData.map(stock => {
                  const update = updatedData.find(u => u && u.symbol === stock.symbol);
                  if (update) {
                    const change = update.price - stock.price;
                    const changePercent = (change / stock.price) * 100;
                    return {
                      ...stock,
                      price: update.price,
                      change: change,
                      changePercent: changePercent,
                      volume: update.volume,
                      lastUpdate: update.lastUpdate,
                      sparklineData: [...stock.sparklineData.slice(1), update.price]
                    };
                  }
                  return stock;
                })
              );
              setLastUpdate(new Date().toLocaleTimeString());
            } catch (error) {
              console.error('Error updating market data:', error);
            }
          }, 30000);

          return () => clearInterval(updateInterval);
        }
      } else {
        console.log('Market is closed - showing last updated data');
        // Market is closed, no real-time updates needed
        setIsConnected(false);
      }

    } catch (error) {
      console.error('Error initializing live data:', error);
      setIsConnected(false);
      
      // Fallback to mock data
      const mockData: LiveMarketData[] = [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          price: 189.45,
          change: 2.34,
          changePercent: 1.25,
          volume: 65000000,
          lastUpdate: new Date().toISOString(),
          sparklineData: Array.from({ length: 20 }, () => Math.random() * 10 + 185)
        },
        {
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          price: 378.90,
          change: -1.23,
          changePercent: -0.32,
          volume: 42000000,
          lastUpdate: new Date().toISOString(),
          sparklineData: Array.from({ length: 20 }, () => Math.random() * 10 + 375)
        },
        {
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          price: 145.67,
          change: 3.45,
          changePercent: 2.42,
          volume: 28000000,
          lastUpdate: new Date().toISOString(),
          sparklineData: Array.from({ length: 20 }, () => Math.random() * 10 + 140)
        },
        {
          symbol: 'AMZN',
          name: 'Amazon.com Inc.',
          price: 155.23,
          change: -2.10,
          changePercent: -1.33,
          volume: 35000000,
          lastUpdate: new Date().toISOString(),
          sparklineData: Array.from({ length: 20 }, () => Math.random() * 10 + 150)
        },
        {
          symbol: 'TSLA',
          name: 'Tesla Inc.',
          price: 267.45,
          change: 18.90,
          changePercent: 7.60,
          volume: 85000000,
          lastUpdate: new Date().toISOString(),
          sparklineData: Array.from({ length: 20 }, () => Math.random() * 20 + 250)
        },
        {
          symbol: 'NVDA',
          name: 'NVIDIA Corporation',
          price: 485.67,
          change: 45.23,
          changePercent: 10.28,
          volume: 45000000,
          lastUpdate: new Date().toISOString(),
          sparklineData: Array.from({ length: 20 }, () => Math.random() * 30 + 460)
        }
      ];

      setMarketData(mockData);
      setIsConnected(true);
      setLastUpdate(new Date().toLocaleTimeString());
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  return (
    <div className="watch-page">
      <div className="watch-header">
        <div className="header-content">
          <h1 className="watch-title">
            {isMarketOpen ? 'Live Market Watch' : 'Market Watch'}
          </h1>
          <div className="connection-status">
            <div className={`status-indicator ${isMarketOpen ? (isConnected ? 'connected' : 'disconnected') : 'closed'}`}></div>
            <span className="status-text">
              {isMarketOpen ? (isConnected ? 'Live' : 'Disconnected') : 'Market Closed'}
            </span>
            {lastUpdate && (
              <span className="last-update">
                {isMarketOpen ? 'Last update:' : 'Last close:'} {lastUpdate}
              </span>
            )}
          </div>
        </div>
        
        <div className="timeframe-selector">
          {timeframes.map(timeframe => (
            <button
              key={timeframe}
              className={`timeframe-btn ${selectedTimeframe === timeframe ? 'active' : ''}`}
              onClick={() => setSelectedTimeframe(timeframe)}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      <div className="watch-content">
        {!isMarketOpen && (
          <div className="market-status-banner">
            <div className="banner-content">
              <span className="banner-icon">📈</span>
              <div className="banner-text">
                <strong>Market Closed</strong>
                <span>Showing last updated stock data from previous trading session</span>
              </div>
            </div>
          </div>
        )}
        
        <MarketOverview />

        <div className="live-stocks">
          <h2>{isMarketOpen ? 'Live Stock Prices' : 'Stock Prices (Last Close)'}</h2>
          <div className="stocks-grid">
            {marketData.map((stock, index) => (
              <div key={stock.symbol} className="stock-card">
                <div className="stock-header">
                  <div className="stock-info">
                    <h3 className="stock-symbol">{stock.symbol}</h3>
                    <p className="stock-name">{stock.name}</p>
                  </div>
                  <div className="price-info">
                    <span className="stock-price">${stock.price.toFixed(2)}</span>
                    <div className={`price-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                      <span>{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}</span>
                      <span>({stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
                    </div>
                  </div>
                </div>
                
                <div className="stock-chart">
                  <SparklineChart data={stock.sparklineData} />
                </div>
                
                <div className="stock-footer">
                  <div className="volume-info">
                    <span>Volume: {formatVolume(stock.volume)}</span>
                  </div>
                  <div className="update-time">
                    <span>{new Date(stock.lastUpdate).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="market-ticker">
          <h2>Market Ticker</h2>
          <div className="ticker-container">
            {marketData.slice(0, 6).map((stock) => (
              <StockTicker
                key={stock.symbol}
                ticker={{
                  symbol: stock.symbol,
                  price: stock.price,
                  change: stock.change,
                  changePercent: stock.changePercent
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
