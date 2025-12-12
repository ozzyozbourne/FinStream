import { restClient } from '@polygon.io/client-js';
import { POLYGON_CONFIG } from '../config/polygonConfig';

// Polygon.io API configuration
const POLYGON_API_KEY = POLYGON_CONFIG.API_KEY;

class PolygonService {
  private client: any;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private lastRequestTime = 0;
  private readonly RATE_LIMIT_DELAY = 12000; // 12 seconds between requests (5 per minute)
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000; // 5 seconds
  private subscribedStocks: Set<string> = new Set();
  private priceUpdateCallback: ((symbol: string, price: number, change: number, changePercent: number) => void) | null = null;
  private isConnecting = false;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private stockPrices: Map<string, { price: number, previousPrice: number, timestamp: number }> = new Map();

  constructor() {
    this.client = restClient(POLYGON_API_KEY);
    console.log('PolygonService initialized with API key:', POLYGON_API_KEY ? 'Present' : 'Missing');
  }

  // WebSocket connection for real-time updates
  connectWebSocket(onPriceUpdate: (symbol: string, price: number, change: number, changePercent: number) => void) {
    // Prevent multiple connection attempts
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket connection already in progress');
      return;
    }

    this.priceUpdateCallback = onPriceUpdate;
    this.isConnecting = true;

    try {
      // Clear any existing connection
      if (this.ws) {
        this.ws.close();
      }

      // Set connection timeout
      this.connectionTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
          console.log('WebSocket connection timeout');
          this.ws.close();
          this.isConnecting = false;
        }
      }, 10000); // 10 second timeout

      // Polygon.io WebSocket endpoint for stocks
      this.ws = new WebSocket(`wss://socket.polygon.io/stocks`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }

        // Wait a bit before sending auth to ensure connection is ready
        setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            try {
              this.ws.send(JSON.stringify({
                action: 'auth',
                params: POLYGON_API_KEY
              }));
            } catch (error) {
              console.error('Error sending auth:', error);
            }
          }
        }, 100);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data[0] === 'status' && data[1] === 'connected') {
            console.log('WebSocket authenticated successfully');
          } else if (data[0] === 'status' && data[1] === 'auth_success') {
            console.log('WebSocket authentication successful');
            // Subscribe to previously subscribed stocks after a short delay
            setTimeout(() => {
              this.subscribedStocks.forEach(symbol => {
                this.subscribeToStock(symbol);
              });
            }, 200);
          } else if (data[0] === 'T') {
            // Trade data received
            this.handleTradeUpdate(data[1]);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;

        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }

        // Only attempt reconnect if it wasn't a manual close
        if (event.code !== 1000) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;

        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.isConnecting = false;

      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }
    }
  }

  private handleTradeUpdate(tradeData: any) {
    if (tradeData && tradeData.sym && tradeData.p && this.priceUpdateCallback) {
      const symbol = tradeData.sym;
      const price = tradeData.p;
      const timestamp = tradeData.t || Date.now();

      // Get previous price data
      const previousData = this.stockPrices.get(symbol);
      let change = 0;
      let changePercent = 0;

      if (previousData) {
        change = price - previousData.previousPrice;
        changePercent = (change / previousData.previousPrice) * 100;
      }

      // Update price tracking
      this.stockPrices.set(symbol, {
        price: price,
        previousPrice: previousData ? previousData.price : price,
        timestamp: timestamp
      });

      console.log(`Real-time trade update for ${symbol}: $${price} (${change >= 0 ? '+' : ''}${change.toFixed(2)})`);
      this.priceUpdateCallback(symbol, price, change, changePercent);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        if (this.priceUpdateCallback) {
          this.connectWebSocket(this.priceUpdateCallback);
        }
      }, this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  subscribeToStock(symbol: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({
          action: 'subscribe',
          params: `T.${symbol}`
        }));
        this.subscribedStocks.add(symbol);
        console.log(`Subscribed to real-time updates for ${symbol}`);
      } catch (error) {
        console.error(`Error subscribing to ${symbol}:`, error);
        // Retry after a short delay
        setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.subscribeToStock(symbol);
          }
        }, 1000);
      }
    } else {
      console.log(`WebSocket not ready, queuing subscription for ${symbol}`);
      // Queue the subscription for when WebSocket is ready
      setTimeout(() => {
        this.subscribeToStock(symbol);
      }, 1000);
    }
  }

  unsubscribeFromStock(symbol: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({
          action: 'unsubscribe',
          params: `T.${symbol}`
        }));
        this.subscribedStocks.delete(symbol);
        console.log(`Unsubscribed from real-time updates for ${symbol}`);
      } catch (error) {
        console.error(`Error unsubscribing from ${symbol}:`, error);
      }
    } else {
      console.log(`WebSocket not ready, removing ${symbol} from subscription queue`);
      this.subscribedStocks.delete(symbol);
    }
  }

  disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.subscribedStocks.clear();
      console.log('WebSocket disconnected');
    }
  }

  // Rate limiting helper
  private async rateLimitedRequest(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;

          if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
            const delay = this.RATE_LIMIT_DELAY - timeSinceLastRequest;
            console.log(`Rate limiting: waiting ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }

          console.log('Making API request to:', url);
          const response = await fetch(url);
          const data = await response.json();

          this.lastRequestTime = Date.now();

          if (data.status === 'ERROR') {
            throw new Error(data.error);
          }

          resolve(data);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  // Fast request for search operations (no rate limiting)
  private async fastRequest(url: string): Promise<any> {
    try {
      console.log('Making fast API request to:', url);
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'ERROR') {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Request failed:', error);
        }
      }
    }

    this.isProcessingQueue = false;
  }

  // Search for stocks by symbol or company name
  async searchStocks(query: string): Promise<any[]> {
    try {
      if (!query.trim()) return [];

      console.log('Searching for stocks:', query);

      const url = `https://api.polygon.io/v3/reference/tickers?search=${query}&market=stocks&active=true&limit=5&apikey=${POLYGON_API_KEY}`;
      const data = await this.fastRequest(url);

      console.log('Search response:', data);

      if (data.status === 'OK') {
        return data.results || [];
      }
      return [];
    } catch (error) {
      console.error('Error searching stocks:', error);
      return [];
    }
  }

  // Get stock details by symbol
  async getStockDetails(symbol: string): Promise<any> {
    try {
      const url = `https://api.polygon.io/v3/reference/tickers/${symbol}?apikey=${POLYGON_API_KEY}`;
      const data = await this.rateLimitedRequest(url);

      console.log(`Stock details for ${symbol}:`, data);

      if (data.status === 'OK') {
        return data.results || null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching stock details:', error);
      return null;
    }
  }

  // Get stock quotes (current price)
  async getStockQuote(symbol: string): Promise<any> {
    try {
      const response = await this.client.lastQuote({
        ticker: symbol
      });

      return response.results || null;
    } catch (error) {
      console.error('Error fetching stock quote:', error);
      return null;
    }
  }

  // Get stock aggregates (OHLCV data)
  async getStockAggregates(symbol: string, timespan: string = 'day', limit: number = 1, useFastRequest: boolean = false): Promise<any> {
    try {
      const from = new Date();
      from.setDate(from.getDate() - 30); // Last 30 days to ensure we get enough data

      const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/${timespan}/${from.toISOString().split('T')[0]}/${new Date().toISOString().split('T')[0]}?apikey=${POLYGON_API_KEY}`;
      const data = useFastRequest ? await this.fastRequest(url) : await this.rateLimitedRequest(url);

      console.log(`Stock aggregates for ${symbol}:`, data);
      console.log(`Stock aggregates results count:`, data.results ? data.results.length : 0);

      if (data.status === 'OK' && data.results) {
        return data.results;
      } else {
        console.log(`Stock aggregates failed for ${symbol}:`, data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching stock aggregates:', error);
      return [];
    }
  }

  // Get historical data for specific date range
  async getHistoricalData(symbol: string, fromDate?: string, toDate?: string): Promise<any> {
    try {
      // Default to last 30 days if no dates provided
      const end = toDate ? new Date(toDate) : new Date();
      const start = fromDate ? new Date(fromDate) : new Date();
      if (!fromDate) start.setDate(start.getDate() - 30);

      const fromStr = start.toISOString().split('T')[0];
      const toStr = end.toISOString().split('T')[0];

      console.log(`Fetching historical data for ${symbol} from ${fromStr} to ${toStr}`);

      const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${fromStr}/${toStr}?apikey=${POLYGON_API_KEY}`;
      const data = await this.rateLimitedRequest(url);

      if (data.status === 'OK' && data.results) {
        return data.results;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }

  // Get market indices (using ETFs for free tier compatibility)
  async getMarketIndices(): Promise<any[]> {
    try {
      // Use ETFs that track major indices (works with free tier)
      const etfs = [
        { symbol: 'SPY', name: 'S&P 500 ETF' },
        { symbol: 'DIA', name: 'Dow Jones ETF' },
        { symbol: 'QQQ', name: 'Nasdaq-100 ETF' }
      ];

      const results = [];

      for (const etf of etfs) {
        try {
          const url = `https://api.polygon.io/v2/aggs/ticker/${etf.symbol}/range/1/day/${new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}/${new Date().toISOString().split('T')[0]}?apikey=${POLYGON_API_KEY}`;
          const data = await this.rateLimitedRequest(url);

          if (data.status === 'OK' && data.results && data.results.length >= 2) {
            const current = data.results[data.results.length - 1];
            const previous = data.results[data.results.length - 2];

            const change = current.c - previous.c;
            const changePercent = (change / previous.c) * 100;

            results.push({
              id: etf.symbol,
              name: etf.name,
              value: current.c,
              change: change,
              changePercent: changePercent,
              sparklineData: data.results.map((r: any) => r.c)
            });
          }
        } catch (error) {
          console.error(`Error fetching ${etf.symbol}:`, error);
        }
      }

      return results;
    } catch (error) {
      console.error('Error fetching market indices:', error);
      return [];
    }
  }

  // Helper method to get index names (kept for compatibility)
  private getIndexName(symbol: string): string {
    const indexNames: { [key: string]: string } = {
      'SPY': 'S&P 500 ETF',
      'DIA': 'Dow Jones ETF',
      'QQQ': 'Nasdaq-100 ETF',
      'I:SPX': 'S&P 500',
      'I:DJI': 'Dow 30',
      'I:IXIC': 'Nasdaq',
      'I:RUT': 'Russell 2000',
      'I:VIX': 'VIX'
    };
    return indexNames[symbol] || symbol;
  }

  // Get popular stocks for initial dashboard
  async getPopularStocks(): Promise<any[]> {
    try {
      console.log('Fetching popular stocks...');

      // Start with just a few stocks to load faster
      const symbols = ['AAPL', 'MSFT', 'GOOGL'];
      const stocks = [];

      for (const symbol of symbols) {
        try {
          console.log(`Fetching data for ${symbol}...`);

          const details = await this.getStockDetails(symbol);
          const aggregates = await this.getStockAggregates(symbol, 'day', 2);

          console.log(`${symbol} - Details:`, details, 'Aggregates:', aggregates);
          console.log(`${symbol} - Aggregates length:`, aggregates.length);

          if (details && aggregates && aggregates.length >= 2) {
            const current = aggregates[aggregates.length - 1];
            const previous = aggregates[aggregates.length - 2];

            const change = current.c - previous.c;
            const changePercent = (change / previous.c) * 100;

            const stockData = {
              symbol: symbol,
              name: details.name || symbol,
              price: current.c,
              change: change,
              changePercent: changePercent
            };

            console.log(`${symbol} processed:`, stockData);
            stocks.push(stockData);

            // Initialize price tracking for real-time updates
            this.stockPrices.set(symbol, {
              price: current.c,
              previousPrice: previous.c,
              timestamp: Date.now()
            });
          } else if (details && aggregates && aggregates.length >= 1) {
            // Use single aggregate data point if we don't have enough for change calculation
            const current = aggregates[aggregates.length - 1];

            const stockData = {
              symbol: symbol,
              name: details.name || symbol,
              price: current.c,
              change: 0, // No change data available
              changePercent: 0
            };

            console.log(`${symbol} processed with single data point:`, stockData);
            stocks.push(stockData);

            // Initialize price tracking for real-time updates
            this.stockPrices.set(symbol, {
              price: current.c,
              previousPrice: current.c,
              timestamp: Date.now()
            });
          } else {
            console.log(`${symbol} - Missing data: details=${!!details}, aggregates=${aggregates ? aggregates.length : 'null'}`);
          }

          // Reduced delay between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          // Continue with other stocks even if one fails
        }
      }

      console.log(`Successfully fetched ${stocks.length} stocks:`, stocks);
      return stocks;
    } catch (error) {
      console.error('Error fetching popular stocks:', error);
      return [];
    }
  }
}

export const polygonService = new PolygonService();
