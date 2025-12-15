import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { yahooService } from '../../services/yahooService';
import { Stock, MarketIndex } from '../../types';
import SearchBar from '../../components/ui/SearchBar';
import StockTicker from '../../components/ui/StockTicker';
import MarketIndexComponent from '../../components/ui/MarketIndex';
import Button from '../../components/ui/Button';
import { ChartModal } from '../../components/ui/ChartModal/ChartModal';
import StockMiniChart from '../../components/ui/StockMiniChart/StockMiniChart';
import WatchlistCandleChart from '../../components/ui/WatchlistCandleChart';
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
  const [viewMode, setViewMode] = useState<'list' | 'columns' | 'grid'>('list');
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

      const indices = await yahooService.getMarketIndices();
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
      setError('Failed to load market data. Please check your internet connection.');
      setIsLoadingIndices(false);
    }
  };


  // Helper to fetch prices for a list of stocks
  const fetchStockPrices = async (stocksToUpdate: Stock[]): Promise<Stock[]> => {
    console.log('Fetching prices for:', stocksToUpdate.length, 'stocks');
    if (stocksToUpdate.length === 0) return [];

    const symbols = stocksToUpdate.map(s => s.symbol);
    const quotes = await yahooService.getBatchQuotes(symbols);

    // Map quotes back to input stocks to preserve any extra fields
    return stocksToUpdate.map(stock => {
      const quote = quotes.find(q => q.symbol === stock.symbol);
      if (quote) {
        return {
          ...stock,
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          name: quote.name
        };
      }
      return stock;
    });
  };

  // Initialize with popular stocks and market indices
  useEffect(() => {
    const initializeData = async () => {
      try {
        setError(null);

        console.log('Initializing dashboard data...');

        // Load saved stocks from localStorage first
        const savedStocksFromStorage = loadStocksFromStorage();
        let initialSavedStocks = [...savedStocksFromStorage];

        // Load watchlist from localStorage
        const watchlistFromStorage = loadWatchlistFromStorage();
        let initialWatchlistStocks = [...watchlistFromStorage];

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

        // Load popular stocks if no saved stocks exist
        if (initialSavedStocks.length === 0) {
          const popularStocks = await yahooService.getPopularStocks();
          if (popularStocks && popularStocks.length > 0) {
            initialSavedStocks = popularStocks.map((stock, index) => ({
              ...stock,
              id: `real-${stock.symbol}-${index}`,
              isSaved: true
            }));
            // Save seemingly empty stocks first so we have something
            setSavedStocks(initialSavedStocks);
            saveStocksToStorage(initialSavedStocks);
          }
        } else {
          setSavedStocks(initialSavedStocks);
        }

        setWatchlistStocks(initialWatchlistStocks);

        // NOW: Fetch prices for EVERYTHING (Saved + Watchlist)
        // This ensures even if market is closed, we see the last close price
        const updatedSavedStocks = await fetchStockPrices(initialSavedStocks);
        setSavedStocks(updatedSavedStocks as SavedStock[]);
        saveStocksToStorage(updatedSavedStocks as SavedStock[]);

        const updatedWatchlistStocks = await fetchStockPrices(initialWatchlistStocks);
        setWatchlistStocks(updatedWatchlistStocks as WatchlistStock[]);
        saveWatchlistToStorage(updatedWatchlistStocks as WatchlistStock[]);

        // Connect to real-time WebSocket
        try {
          yahooService.connectWebSocket((symbol: string, price: number, change: number, changePercent: number) => {
            console.log(`Real-time update: ${symbol} = $${price}`);
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
                index.id === `I:${symbol}` || index.name.toLowerCase().includes(symbol.toLowerCase()) || index.id === symbol
                  ? { ...index, value: price, change, changePercent }
                  : index
              )
            );
          });

          // Subscribe to everything
          [...updatedSavedStocks, ...updatedWatchlistStocks].forEach(stock => {
            yahooService.subscribeToStock(stock.symbol);
          });

        } catch (error) {
          console.log('WebSocket connection failed:', error);
        }

      } catch (err) {
        console.error('Error initializing data:', err);
        setError('Failed to load market data.');
        setIsLoadingIndices(false);
      }
    };

    initializeData();

    // Cleanup WebSocket on component unmount
    return () => {
      yahooService.disconnectWebSocket();
    };
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      setIsSearching(true);
      setError(null);

      try {
        const searchResults = await yahooService.searchStocks(query);

        // Fetch current prices immediately
        const detailedResults = await fetchStockPrices(searchResults);
        setSearchResults(detailedResults);

      } catch (err) {
        console.error('Error searching stocks:', err);
        setError('Failed to search stocks.');
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
    yahooService.subscribeToStock(stock.symbol);

    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveStock = (stockId: string) => {
    const stockToRemove = savedStocks.find(stock => stock.id === stockId);
    if (stockToRemove) {
      // Unsubscribe from real-time updates
      yahooService.unsubscribeFromStock(stockToRemove.symbol);
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
    yahooService.subscribeToStock(stock.symbol);

    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveFromWatchlist = (stockId: string) => {
    const stockToRemove = watchlistStocks.find(stock => stock.id === stockId);
    if (stockToRemove) {
      // Unsubscribe from real-time updates
      yahooService.unsubscribeFromStock(stockToRemove.symbol);
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

  const handleDragEndWatchlist = (event: any) => {
    const { active, over } = event;
    setIsDragging(false);

    if (active && over && active.id !== over.id) {
      setWatchlistStocks((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedItems = arrayMove(items, oldIndex, newIndex);
          // Save the reordered watchlist to localStorage
          saveWatchlistToStorage(reorderedItems);
          return reorderedItems;
        }
        return items;
      });
    }
  };


  // Helper component for Sortable Item (moved inside or kept outside - keeping outside logic concept but in file)
  // Since the original file had SortableStockItem used but not defined in the snippet I saw, 
  // I must assume it is either imported or defined below line 800 which I didn't see.
  // Wait, I didn't see SortableStockItem definition in previous `view_file` output (lines 1-800).
  // It must be at the bottom.
  // I am replacing lines 1-967 (presumably whole file).
  // I need to ensure `SortableStockItem` is included. I'll define it at bottom if missing or just keep it if I can see it.
  // I'll check the file content again to be safe about SortableStockItem.
  // Actually, I can just not replace the bottom part if I am unsure, but I need to replace imports at top.
  // Use `replace_file_content` with Range? No, imports are at top, but `fetchStockPrices` and `initializeData` are in middle.
  // I'll try to keep the `SortableStockItem` if it was there.
  // Let me `view_file` the bottom part first to be safe.


  return (
    <div className="custom-dashboard">
      <div className="dashboard-header-container">
        <h1 className="dashboard-title">Analytics Dashboard</h1>

        {/* Search Section Moved Here */}
        <div className="search-container-header" ref={searchContainerRef}>
          <SearchBar
            placeholder="Search for stocks..."
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

      {showChart && <ChartModal symbol={chartSymbol} onClose={() => setShowChart(false)} />}

      <div className="dashboard-content">

        {/* Saved Stocks Section */}
        <div className="saved-stocks-section">
          <div className="section-header">
            <h3 className="section-title">
              Saved Stocks
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
                variant={viewMode === 'columns' ? 'primary' : 'outline'}
                size="small"
                onClick={() => setViewMode('columns')}
                className="view-toggle"
              >
                Columns
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
                      onAddToWatchlist={handleAddToWatchlist}
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
                {watchlistTitle}
                {/* <span style={{ fontSize: '0.75rem', marginLeft: '8px', opacity: 0.6 }}>✏️</span> */}
              </h3>
            )}
          </div>

          {watchlistStocks.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEndWatchlist}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext items={watchlistStocks.map(stock => stock.id)} strategy={verticalListSortingStrategy}>
                <div className="saved-stocks-container list">
                  {watchlistStocks.map((stock) => (
                    <SortableWatchlistItem
                      key={stock.id}
                      stock={stock}
                      onRemove={handleRemoveFromWatchlist}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="empty-state">
              <p>No stocks in watchlist yet. Search and add stocks to watch!</p>
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
  viewMode: 'list' | 'columns' | 'grid';
  onViewChart: (symbol: string) => void;
  onViewRealtime: (symbol: string) => void;
  onViewHistorical: (symbol: string) => void;
  onAddToWatchlist: (stock: Stock) => void;
}> = ({ stock, onRemove, viewMode, onViewChart, onViewRealtime, onViewHistorical, onAddToWatchlist }) => {
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
          <Button variant="outline" size="small" onClick={(e?: React.MouseEvent) => { e?.stopPropagation(); onAddToWatchlist(stock); }}>Watch</Button>
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
      <div className="stock-item-row" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
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
          <Button variant="outline" size="small" onClick={(e?: React.MouseEvent) => { e?.stopPropagation(); onAddToWatchlist(stock); }}>Watch</Button>
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

      {/* Micro-Chart Section */}
      <StockMiniChart stock={stock} />
    </div>
  );
};

// Sortable Watchlist Item Component
const SortableWatchlistItem: React.FC<{
  stock: WatchlistStock;
  onRemove: (stockId: string) => void;
}> = ({ stock, onRemove }) => {
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
    zIndex: isDragging ? 1000 : 1,
    position: 'relative' as 'relative', // Explicitly cast to valid CSS position type
    marginBottom: '1rem',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`saved-stock-item list-item ${isDragging ? 'dragging' : ''}`}
    >
      <div className="stock-item-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <div {...attributes} {...listeners} className="drag-handle" style={{ cursor: 'grab', color: '#666', fontSize: '1.2rem' }}>⋮⋮</div>
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
        </div>
        <Button
          variant="outline"
          size="small"
          onClick={() => onRemove(stock.id)}
          className="remove-button"
        >
          Remove
        </Button>
      </div>
      <div style={{ marginTop: '1rem', width: '100%' }}>
        <WatchlistCandleChart stock={stock} height={250} />
      </div>
    </div>
  );
};

export default CustomDashboard;