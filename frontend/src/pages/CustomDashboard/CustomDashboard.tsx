import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { polygonService } from '../../services/polygonService';
import { Stock, MarketIndex } from '../../types';
import SearchBar from '../../components/ui/SearchBar';
import StockTicker from '../../components/ui/StockTicker';
import MarketIndexComponent from '../../components/ui/MarketIndex';
import Button from '../../components/ui/Button';
import { ChartModal } from '../../components/ui/ChartModal/ChartModal';
import './CustomDashboard.css';

interface SavedStock extends Stock {
  id: string;
  isSaved: boolean;
}

interface WatchlistStock extends Stock {
  id: string;
  addedAt: number;
}

// Local storage keys
const SAVED_STOCKS_KEY = 'finStream_savedStocks';
const WATCHLIST_KEY = 'finStream_watchlist';
const WATCHLIST_TITLE_KEY = 'finStream_watchlistTitle';

// Helper functions for localStorage
const saveStocksToStorage = (stocks: SavedStock[]) => {
  try {
    localStorage.setItem(SAVED_STOCKS_KEY, JSON.stringify(stocks));
    console.log('Saved stocks to localStorage:', stocks.length);
  } catch (error) {
    console.error('Error saving stocks to localStorage:', error);
  }
};

const loadStocksFromStorage = (): SavedStock[] => {
  try {
    const saved = localStorage.getItem(SAVED_STOCKS_KEY);
    if (saved) {
      const stocks = JSON.parse(saved);
      console.log('Loaded stocks from localStorage:', stocks.length);
      return stocks;
    }
  } catch (error) {
    console.error('Error loading stocks from localStorage:', error);
  }
  return [];
};

const saveWatchlistToStorage = (stocks: WatchlistStock[]) => {
  try {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(stocks));
    console.log('Saved watchlist to localStorage:', stocks.length);
  } catch (error) {
    console.error('Error saving watchlist to localStorage:', error);
  }
};

const loadWatchlistFromStorage = (): WatchlistStock[] => {
  try {
    const saved = localStorage.getItem(WATCHLIST_KEY);
    if (saved) {
      const stocks = JSON.parse(saved);
      console.log('Loaded watchlist from localStorage:', stocks.length);
      return stocks;
    }
  } catch (error) {
    console.error('Error loading watchlist from localStorage:', error);
  }
  return [];
};

const saveWatchlistTitleToStorage = (title: string) => {
  try {
    localStorage.setItem(WATCHLIST_TITLE_KEY, title);
  } catch (error) {
    console.error('Error saving watchlist title to localStorage:', error);
  }
};

const loadWatchlistTitleFromStorage = (): string => {
  try {
    const saved = localStorage.getItem(WATCHLIST_TITLE_KEY);
    if (saved) {
      return saved;
    }
  } catch (error) {
    console.error('Error loading watchlist title from localStorage:', error);
  }
  return 'Watchlist';
};

// Market status helper functions
const checkMarketStatus = (): { isOpen: boolean; status: string; nextOpen?: string } => {
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const estTime = new Date(utcTime + (-5 * 3600000)); // EST is UTC-5
  const day = estTime.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = estTime.getHours();
  const minute = estTime.getMinutes();
  const currentTime = hour * 60 + minute;

  // Market is closed on weekends
  if (day === 0 || day === 6) {
    const nextMonday = new Date(estTime);
    nextMonday.setDate(estTime.getDate() + (day === 0 ? 1 : 2));
    nextMonday.setHours(9, 30, 0, 0);
    return {
      isOpen: false,
      status: 'Market Closed - Weekend',
      nextOpen: nextMonday.toLocaleString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit',
        timeZoneName: 'short'
      })
    };
  }

  // Market hours: 9:30 AM - 4:00 PM EST (Monday-Friday)
  const marketOpen = 9 * 60 + 30; // 9:30 AM
  const marketClose = 16 * 60; // 4:00 PM

  if (currentTime >= marketOpen && currentTime < marketClose) {
    return {
      isOpen: true,
      status: 'Market Open'
    };
  } else if (currentTime < marketOpen) {
    const nextOpen = new Date(estTime);
    nextOpen.setHours(9, 30, 0, 0);
    return {
      isOpen: false,
      status: 'Market Closed - Pre-Market',
      nextOpen: nextOpen.toLocaleString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        timeZoneName: 'short'
      })
    };
  } else {
    const nextOpen = new Date(estTime);
    nextOpen.setDate(estTime.getDate() + 1);
    nextOpen.setHours(9, 30, 0, 0);
    return {
      isOpen: false,
      status: 'Market Closed - After Hours',
      nextOpen: nextOpen.toLocaleString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit',
        timeZoneName: 'short'
      })
    };
  }
};

const CustomDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [savedStocks, setSavedStocks] = useState<SavedStock[]>([]);
  const [watchlistStocks, setWatchlistStocks] = useState<WatchlistStock[]>([]);
  const [watchlistTitle, setWatchlistTitle] = useState<string>('Watchlist');
  const [isEditingWatchlistTitle, setIsEditingWatchlistTitle] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [isLoadingIndices, setIsLoadingIndices] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isDragging, setIsDragging] = useState(false);
  const [isMarketOpen, setIsMarketOpen] = useState<boolean | null>(null);
  const [marketStatus, setMarketStatus] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const [realtimeData, setRealtimeData] = useState<any>(null);
  const [showChart, setShowChart] = useState(false);
  const [chartSymbol, setChartSymbol] = useState('AAPL');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Check market status on component mount and update periodically
  useEffect(() => {
    const updateMarketStatus = () => {
      const marketInfo = checkMarketStatus();
      const wasOpen = isMarketOpen;
      setIsMarketOpen(marketInfo.isOpen);
      setMarketStatus(marketInfo.status);
      
      // If market just opened, load market data
      if (marketInfo.isOpen && !wasOpen && marketIndices.length === 0) {
        console.log('Market just opened, loading market data...');
        loadMarketData();
      }
      // If market just closed, stop loading
      else if (!marketInfo.isOpen && wasOpen) {
        console.log('Market just closed, stopping data loading...');
        setIsLoadingIndices(false);
      }
    };

    // Initial check
    updateMarketStatus();

    // Update every minute
    const interval = setInterval(updateMarketStatus, 60000);

    return () => clearInterval(interval);
  }, [isMarketOpen, marketIndices.length]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchQuery('');
        setSearchResults([]);
      }
    };

    if (searchQuery) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchQuery]);

  // Function to load market data
  const loadMarketData = async () => {
    try {
      setIsLoadingIndices(true);
      setError(null);
      
      console.log('Loading market data...');
      
      const indices = await polygonService.getMarketIndices();
      console.log('Market indices result:', indices);
      
      if (indices && indices.length > 0) {
        setMarketIndices(indices);
        setLastUpdated(new Date());
        console.log('Real market data loaded');
      } else {
        console.log('No market indices returned from API');
      }
      
      setIsLoadingIndices(false);
    } catch (err) {
      console.error('Market data loading failed:', err);
      setError('Failed to load market data. Please check your API key and internet connection.');
      setIsLoadingIndices(false);
    }
  };

  // Initialize with popular stocks and market indices
  useEffect(() => {
    const initializeData = async () => {
      try {
        setError(null);
        
        console.log('Initializing dashboard data...');
        
        // Load saved stocks from localStorage first
        const savedStocksFromStorage = loadStocksFromStorage();
        setSavedStocks(savedStocksFromStorage);
        
        // Load watchlist from localStorage
        const watchlistFromStorage = loadWatchlistFromStorage();
        setWatchlistStocks(watchlistFromStorage);
        
        // Load watchlist title from localStorage
        const savedTitle = loadWatchlistTitleFromStorage();
        setWatchlistTitle(savedTitle);
        
        setMarketIndices([]);
        
        // Check market status first
        const marketInfo = checkMarketStatus();
        setIsMarketOpen(marketInfo.isOpen);
        setMarketStatus(marketInfo.status);
        
        // Only load market data if market is open
        if (marketInfo.isOpen) {
          await loadMarketData();
        } else {
          setIsLoadingIndices(false);
          console.log('Market is closed, skipping market data loading');
        }
        
        // Connect to real-time WebSocket with error handling
        try {
          polygonService.connectWebSocket((symbol: string, price: number, change: number, changePercent: number) => {
            console.log(`Real-time update: ${symbol} = $${price} (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`);
            setIsRealtimeConnected(true);
            
            // Update saved stocks
            setSavedStocks(prevStocks => 
              prevStocks.map(stock => 
                stock.symbol === symbol 
                  ? { ...stock, price, change, changePercent }
                  : stock
              )
            );
            
            // Update watchlist stocks
            setWatchlistStocks(prevStocks => 
              prevStocks.map(stock => 
                stock.symbol === symbol 
                  ? { ...stock, price, change, changePercent }
                  : stock
              )
            );
            
            // Update market ticker
            setMarketIndices(prevIndices =>
              prevIndices.map(index =>
                index.id === `I:${symbol}` || index.name.toLowerCase().includes(symbol.toLowerCase())
                  ? { ...index, value: price, change, changePercent }
                  : index
              )
            );
          });
        } catch (error) {
          console.log('WebSocket connection failed, continuing without real-time updates:', error);
        }
        
        // Load real stock data
        try {
          console.log('Loading real stock data...');
          
          const popularStocks = await polygonService.getPopularStocks();
          console.log('Popular stocks result:', popularStocks);
          console.log('Popular stocks length:', popularStocks ? popularStocks.length : 'null');
          
          // Only load popular stocks if no saved stocks exist
          if (savedStocksFromStorage.length === 0) {
            if (popularStocks && popularStocks.length > 0) {
              const realStocks: SavedStock[] = popularStocks.map((stock, index) => ({
                ...stock,
                id: `real-${stock.symbol}-${index}`,
                isSaved: true
              }));
              console.log('Setting real stock data:', realStocks);
              console.log('Real stocks length:', realStocks.length);
              setSavedStocks(realStocks);
              saveStocksToStorage(realStocks);
              
              // Subscribe to real-time updates for new stocks
              realStocks.forEach(stock => {
                polygonService.subscribeToStock(stock.symbol);
              });
              
              console.log(`Real stock data loaded: ${realStocks.length} stocks`);
            } else {
              console.log('No popular stocks returned from API');
            }
          } else {
            // Subscribe to real-time updates for existing saved stocks
            savedStocksFromStorage.forEach(stock => {
              polygonService.subscribeToStock(stock.symbol);
            });
            console.log(`Loaded ${savedStocksFromStorage.length} saved stocks from localStorage`);
            
            // Subscribe to real-time updates for watchlist stocks
            watchlistFromStorage.forEach(stock => {
              polygonService.subscribeToStock(stock.symbol);
            });
            console.log(`Loaded ${watchlistFromStorage.length} watchlist stocks from localStorage`);
          }
        } catch (err) {
          console.error('Stock data loading failed:', err);
          setError('Failed to load stock data. Please check your API key and internet connection.');
        }
        
      } catch (err) {
        console.error('Error initializing data:', err);
        setError('Failed to load market data. Please check your API key.');
        setIsLoadingIndices(false);
      }
    };

    initializeData();
    
    // Cleanup WebSocket on component unmount
    return () => {
      polygonService.disconnectWebSocket();
    };
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      setIsSearching(true);
      setError(null);
      
      try {
        console.log('start searching api call...............................................')
        // Search for stocks using Polygon.io API
        const searchResults = await polygonService.searchStocks(query);

        console.log("searchResults from api call......**************************************", searchResults);
        
        // Convert API results to our Stock format - show immediately with basic info
        const stocks: Stock[] = searchResults.map((result) => ({
          symbol: result.ticker,
          name: result.name || result.ticker,
          price: 0, // Will be updated with real data
          change: 0,
          changePercent: 0
        }));

        console.log("stocks searched......", stocks);
        
        // Show results immediately
        setSearchResults(stocks);
        
        // Load price data for each stock
        console.log('Loading price data...');
        const updatedStocks = await Promise.all(
          stocks.map(async (stock) => {
            try {
              const aggregates = await polygonService.getStockAggregates(stock.symbol, 'day', 2, true);
              
              console.log(`Aggregates for ${stock.symbol}:`, aggregates);
              
              if (aggregates && aggregates.length >= 2) {
                const current = aggregates[aggregates.length - 1];
                const previous = aggregates[aggregates.length - 2];
                
                const change = current.c - previous.c;
                const changePercent = (change / previous.c) * 100;

                return {
                  ...stock,
                  price: current.c,
                  change: change,
                  changePercent: changePercent
                };
              } else if (aggregates && aggregates.length >= 1) {
                const current = aggregates[aggregates.length - 1];
                return {
                  ...stock,
                  price: current.c,
                  change: 0,
                  changePercent: 0
                };
              }
              
              return stock; // Keep original if no data
            } catch (error) {
              console.error(`Error fetching price for ${stock.symbol}:`, error);
              return stock; // Keep original on error
            }
          })
        );
        
        console.log('Updated stocks with price data:', updatedStocks);
        setSearchResults(updatedStocks);
      } catch (err) {
        console.error('Error searching stocks:', err);
        setError('Failed to search stocks. Please try again.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleAddStock = (stock: Stock) => {
    const newSavedStock: SavedStock = {
      ...stock,
      id: `saved-${stock.symbol}-${Date.now()}`,
      isSaved: true
    };
    
    setSavedStocks(prev => {
      const updatedStocks = [...prev, newSavedStock];
      saveStocksToStorage(updatedStocks);
      return updatedStocks;
    });
    
    // Subscribe to real-time updates for the new stock
    polygonService.subscribeToStock(stock.symbol);
    
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveStock = (stockId: string) => {
    const stockToRemove = savedStocks.find(stock => stock.id === stockId);
    if (stockToRemove) {
      // Unsubscribe from real-time updates
      polygonService.unsubscribeFromStock(stockToRemove.symbol);
    }
    
    setSavedStocks(prev => {
      const updatedStocks = prev.filter(stock => stock.id !== stockId);
      saveStocksToStorage(updatedStocks);
      return updatedStocks;
    });
  };

  const handleAddToWatchlist = (stock: Stock) => {
    const newWatchlistStock: WatchlistStock = {
      ...stock,
      id: `watchlist-${stock.symbol}-${Date.now()}`,
      addedAt: Date.now()
    };
    
    setWatchlistStocks(prev => {
      const updatedStocks = [...prev, newWatchlistStock];
      saveWatchlistToStorage(updatedStocks);
      return updatedStocks;
    });
    
    // Subscribe to real-time updates for the new stock
    polygonService.subscribeToStock(stock.symbol);
    
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveFromWatchlist = (stockId: string) => {
    const stockToRemove = watchlistStocks.find(stock => stock.id === stockId);
    if (stockToRemove) {
      // Unsubscribe from real-time updates
      polygonService.unsubscribeFromStock(stockToRemove.symbol);
    }
    
    setWatchlistStocks(prev => {
      const updatedStocks = prev.filter(stock => stock.id !== stockId);
      saveWatchlistToStorage(updatedStocks);
      return updatedStocks;
    });
  };

  const handleWatchlistTitleChange = (newTitle: string) => {
    setWatchlistTitle(newTitle);
    saveWatchlistTitleToStorage(newTitle);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setIsDragging(false);

    if (active.id !== over.id) {
      setSavedStocks((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        
        // Save the reordered stocks to localStorage
        saveStocksToStorage(reorderedItems);
        
        return reorderedItems;
      });
    }
  };

  return (
    <div className="custom-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Portfolio Analytics Dashboard</h1>
        <p className="dashboard-subtitle">Real-time market insights and personalized stock tracking</p>
        {isRealtimeConnected && (
          <div className="realtime-indicator">
            <div className="realtime-dot"></div>
            <span>Live Updates Active</span>
          </div>
        )}
      </div>
      {showChart && <ChartModal symbol={chartSymbol} onClose={() => setShowChart(false)} />}

      {/* Live Market Ticker */}
      <div className="market-ticker">
        <div className="ticker-content">
          <span className="ticker-label">Live Market:</span>
          {isMarketOpen === null ? (
            <div className="ticker-loading">Checking market status...</div>
          ) : isMarketOpen ? (
            marketIndices.length > 0 ? (
              marketIndices.map((index) => (
                <div key={index.id} className="ticker-item">
                  <span className="ticker-name">{index.name}</span>
                  <span className="ticker-value">${index.value.toFixed(2)}</span>
                  <span className={`ticker-change ${index.change >= 0 ? 'positive' : 'negative'}`}>
                    {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
                  </span>
                </div>
              ))
            ) : (
              <div className="ticker-loading">Loading market data...</div>
            )
          ) : (
            <div className="market-closed">
              <div className="market-status">
                <span className="status-icon">🔒</span>
                <span className="status-text">{marketStatus}</span>
              </div>
              <div className="market-hours">
                <span className="hours-label">Market Hours:</span>
                <span className="hours-text">9:30 AM - 4:00 PM EST (Mon-Fri)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        {/* Search Section */}
        <div className="search-section-cd">
          <div className="search-header">
            <h3 className="section-title">Add New Stocks</h3>
            <p className="section-subtitle">Search and add stocks to your dashboard</p>
          </div>
          
          <div className="search-container" ref={searchContainerRef}>
            <SearchBar
              placeholder="Search for stocks by symbol or company name..."
              onSearch={handleSearch}
              className="stock-search"
            />
            
            {searchQuery && (
              <div className="search-dropdown">
                {isSearching ? (
                  <div className="search-loading">
                    <div className="loading-spinner"></div>
                    <span>Searching stocks...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="search-results">
                    <div className="results-header">
                      <span className="results-count">{searchResults.length} results found</span>
                    </div>
                    <div className="results-list">
                      {searchResults.map((stock) => (
                        <div key={stock.symbol} className="search-result-item">
                          <div className="result-info">
                            <div className="result-header">
                              <span className="result-symbol">{stock.symbol}</span>
                              <span className="result-name">{stock.name}</span>
                            </div>
                            <div className="result-price">
                              {stock.price > 0 ? (
                                <>
                                  <span className="price">${stock.price.toFixed(2)}</span>
                                  <span className={`change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                                  </span>
                                </>
                              ) : (
                                <span className="price loading">Loading price...</span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="primary"
                            size="small"
                            onClick={() => handleAddStock(stock)}
                            className="add-button"
                          >
                            Add
                          </Button>
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => handleAddToWatchlist(stock)}
                            className="add-button"
                          >
                            Watch
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="no-results">
                    <div className="no-results-icon">🔍</div>
                    <span>No stocks found matching "{searchQuery}"</span>
                    <p>Try searching with a different term</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Saved Stocks Section */}
        <div className="saved-stocks-section">
          <div className="section-header">
            <h3 className="section-title">
              Saved Stocks ({savedStocks.length})
              <span className="drag-hint">Drag to rearrange</span>
            </h3>
            <div className="view-controls">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="small"
                onClick={() => setViewMode('list')}
                className="view-toggle"
              >
                List
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="small"
                onClick={() => setViewMode('grid')}
                className="view-toggle"
              >
                Grid
              </Button>
            </div>
          </div>
          
          {savedStocks.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext items={savedStocks.map(stock => stock.id)} strategy={verticalListSortingStrategy}>
                <div className={`saved-stocks-container ${viewMode} ${isDragging ? 'dragging-active' : ''}`}>
                  {savedStocks.map((stock) => (
                    <SortableStockItem
                      key={stock.id}
                      stock={stock}
                      onRemove={handleRemoveStock}
                      viewMode={viewMode}
                      onViewChart={(symbol) => {
                        setChartSymbol(symbol);
                        setShowChart(true);
                      }}
                      onViewRealtime={(symbol) => navigate('/research')}
                      onViewHistorical={(symbol) => navigate(`/historical-data?symbol=${symbol}`)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="empty-state">
              <p>No saved stocks yet. Search and add stocks to get started!</p>
            </div>
          )}
        </div>

        {/* Watchlist Section */}
        <div className="saved-stocks-section">
          <div className="section-header">
            {isEditingWatchlistTitle ? (
              <input
                type="text"
                value={watchlistTitle}
                onChange={(e) => setWatchlistTitle(e.target.value)}
                onBlur={() => {
                  setIsEditingWatchlistTitle(false);
                  saveWatchlistTitleToStorage(watchlistTitle);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditingWatchlistTitle(false);
                    saveWatchlistTitleToStorage(watchlistTitle);
                  }
                }}
                autoFocus
                className="watchlist-title-input"
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  outline: 'none'
                }}
              />
            ) : (
              <h3 
                className="section-title"
                onClick={() => setIsEditingWatchlistTitle(true)}
                style={{ cursor: 'pointer' }}
                title="Click to edit title"
              >
                {watchlistTitle} ({watchlistStocks.length})
                {/* <span style={{ fontSize: '0.75rem', marginLeft: '8px', opacity: 0.6 }}>✏️</span> */}
              </h3>
            )}
          </div>
          
          {watchlistStocks.length > 0 ? (
            <div className="saved-stocks-container list">
              {watchlistStocks.map((stock) => (
                <div key={stock.id} className="saved-stock-item list-item">
                  <div className="stock-info">
                    <div className="stock-details">
                      <span className="stock-symbol">{stock.symbol}</span>
                      <span className="stock-name">{stock.name}</span>
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
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => handleRemoveFromWatchlist(stock.id)}
                    className="remove-button"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No stocks in watchlist yet. Search and add stocks to watch!</p>
            </div>
          )}
        </div>

        {/* Market Overview Section */}
        <div className="market-overview-section">
          <div className="section-header">
            <h3 className="section-title">Market Overview</h3>
            {lastUpdated && (
              <div className="last-updated">
                <span className="updated-label">Last Updated:</span>
                <span className="updated-time">
                  {lastUpdated.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZoneName: 'short'
                  })}
                </span>
              </div>
            )}
          </div>
          
          {isLoadingIndices ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading market data...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
            </div>
          ) : marketIndices.length > 0 ? (
            <div className="market-indices-grid">
              {marketIndices.map((index) => (
                <MarketIndexComponent key={index.id} index={index} />
              ))}
            </div>
          ) : isMarketOpen === false ? (
            <div className="market-closed-overview">
              <div className="closed-icon">📊</div>
              <h4>Market Data Unavailable</h4>
              <p>The market is currently closed. Market data will be available during trading hours.</p>
              <div className="trading-hours">
                <strong>Trading Hours:</strong> 9:30 AM - 4:00 PM EST (Monday-Friday)
              </div>
            </div>
          ) : (
            <div className="no-data-state">
              <div className="no-data-icon">📈</div>
              <p>No market data available at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sortable Stock Item Component
const SortableStockItem: React.FC<{
  stock: SavedStock;
  onRemove: (stockId: string) => void;
  viewMode: 'list' | 'grid';
  onViewChart: (symbol: string) => void;
  onViewRealtime: (symbol: string) => void;
  onViewHistorical: (symbol: string) => void;
}> = ({ stock, onRemove, viewMode, onViewChart, onViewRealtime, onViewHistorical }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stock.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (viewMode === 'grid') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`saved-stock-item grid-item ${isDragging ? 'dragging' : ''}`}
      >
        <div {...attributes} {...listeners} className="drag-handle">⋮⋮</div>
        <div className="stock-info">
          <div className="stock-details">
            <span className="stock-symbol">{stock.symbol}</span>
            <span className="stock-name">{stock.name}</span>
          </div>
          <div className="stock-price">
            <span className="price">${stock.price.toFixed(2)}</span>
            <span className={`change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="stock-actions">
          <Button variant="primary" size="small" onClick={(e?: React.MouseEvent) => { e?.stopPropagation(); onViewRealtime(stock.symbol); }}>Real-Time</Button>
          <Button variant="outline" size="small" onClick={(e?: React.MouseEvent) => { e?.stopPropagation(); onViewHistorical(stock.symbol); }}>Historical</Button>
          <Button variant="outline" size="small" onClick={(e?: React.MouseEvent) => { e?.stopPropagation(); onViewChart(stock.symbol); }}>Chart</Button>
        </div>
        <Button
          variant="outline"
          size="small"
          onClick={(e?: React.MouseEvent) => {
            e?.stopPropagation();
            onRemove(stock.id);
          }}
          className="remove-button"
        >
          Remove
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`saved-stock-item list-item ${isDragging ? 'dragging' : ''}`}
    >
      <div {...attributes} {...listeners} className="drag-handle">⋮⋮</div>
      <div className="stock-info">
        <div className="stock-details">
          <span className="stock-symbol">{stock.symbol}</span>
          <span className="stock-name">{stock.name}</span>
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
      <div className="stock-actions">
        <Button variant="primary" size="small" onClick={(e?: React.MouseEvent) => { e?.stopPropagation(); onViewRealtime(stock.symbol); }}>Real-Time</Button>
        <Button variant="outline" size="small" onClick={(e?: React.MouseEvent) => { e?.stopPropagation(); onViewHistorical(stock.symbol); }}>Historical</Button>
        <Button variant="outline" size="small" onClick={(e?: React.MouseEvent) => { e?.stopPropagation(); onViewChart(stock.symbol); }}>Chart</Button>
      </div>
      <Button
        variant="outline"
        size="small"
        onClick={(e?: React.MouseEvent) => {
          e?.stopPropagation();
          onRemove(stock.id);
        }}
        className="remove-button"
      >
        Remove
      </Button>
    </div>
  );
};

export default CustomDashboard;