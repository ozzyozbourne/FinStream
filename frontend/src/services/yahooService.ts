import { Stock, MarketIndex } from '../types';

const BACKEND_API = 'http://localhost:3001/api/yahoo';
const WS_URL = 'ws://localhost:3001';

class YahooService {
    private ws: WebSocket | null = null;
    private subscribedStocks: Set<string> = new Set();
    private priceUpdateCallback: ((symbol: string, price: number, change: number, changePercent: number) => void) | null = null;
    private pollingInterval: NodeJS.Timeout | null = null;

    // Search for stocks
    async searchStocks(query: string): Promise<Stock[]> {
        try {
            if (!query.trim()) return [];

            const response = await fetch(`${BACKEND_API}/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (data.results) {
                return data.results.map((item: any) => ({
                    symbol: item.symbol,
                    name: item.name,
                    price: 0,
                    change: 0,
                    changePercent: 0
                }));
            }
            return [];
        } catch (error) {
            console.error('Error searching stocks via Yahoo:', error);
            return [];
        }
    }

    // Get batch quotes (efficient)
    async getBatchQuotes(symbols: string[]): Promise<Stock[]> {
        try {
            if (symbols.length === 0) return [];

            const symbolsStr = symbols.join(',');
            const response = await fetch(`${BACKEND_API}/quotes?symbols=${symbolsStr}`);
            const data = await response.json();

            if (Array.isArray(data)) {
                return data.map((item: any) => ({
                    symbol: item.symbol,
                    name: item.name,
                    price: item.price,
                    change: item.change,
                    changePercent: item.changePercent
                }));
            }
            return [];
        } catch (error) {
            console.error('Error fetching batch quotes:', error);
            return [];
        }
    }

    // Get Market Indices (using ETF proxies same as before but via Yahoo)
    async getMarketIndices(): Promise<MarketIndex[]> {
        const indicesMap = [
            { id: 'SPY', name: 'S&P 500 ETF' },
            { id: 'DIA', name: 'Dow Jones ETF' },
            { id: 'QQQ', name: 'Nasdaq-100 ETF' }
        ];

        const symbols = indicesMap.map(i => i.id);
        const quotes = await this.getBatchQuotes(symbols);

        return quotes.map(q => {
            const match = indicesMap.find(i => i.id === q.symbol);
            return {
                id: q.symbol,
                name: match?.name || q.name,
                value: q.price,
                change: q.change,
                changePercent: q.changePercent,
                sparklineData: [] // Sparkline not easily available in batch quote, omitting for efficiency
            };
        });
    }

    // Get Popular Stocks
    async getPopularStocks(): Promise<Stock[]> {
        const popularSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'AMD', 'META'];
        return this.getBatchQuotes(popularSymbols);
    }

    // Connect WebSocket (Simulated via Polling)
    connectWebSocket(onPriceUpdate: (symbol: string, price: number, change: number, changePercent: number) => void) {
        if (this.pollingInterval) return;

        this.priceUpdateCallback = onPriceUpdate;
        console.log('Starting Yahoo Finance polling service...');

        // Poll every 5 seconds
        this.pollingInterval = setInterval(async () => {
            if (this.subscribedStocks.size === 0) return;

            const symbols = Array.from(this.subscribedStocks);
            // Chunk symbols if necessary (URL length limits), but for now assuming < 50 stocks
            const quotes = await this.getBatchQuotes(symbols);

            quotes.forEach(quote => {
                if (this.priceUpdateCallback) {
                    this.priceUpdateCallback(quote.symbol, quote.price, quote.change, quote.changePercent);
                }
            });

        }, 5000);
    }

    subscribeToStock(symbol: string) {
        this.subscribedStocks.add(symbol);
        // Initial fetch helper
        this.getBatchQuotes([symbol]).then(quotes => {
            if (quotes.length > 0 && this.priceUpdateCallback) {
                const q = quotes[0];
                this.priceUpdateCallback(q.symbol, q.price, q.change, q.changePercent);
            }
        });
    }

    unsubscribeFromStock(symbol: string) {
        this.subscribedStocks.delete(symbol);
    }

    disconnectWebSocket() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        this.subscribedStocks.clear();
        console.log('Stopped Yahoo Finance polling service');
    }

    // Legacy/Compatibility methods
    async getStockAggregates(symbol: string, timespan: string = 'day', limit: number = 1): Promise<any[]> {
        // This is mainly used for sparklines or previous close calculation in old logic.
        // We can fetch history from backend.
        try {
            const response = await fetch(`${BACKEND_API}/history?symbol=${symbol}&range=5d&interval=1d`);
            const data = await response.json();
            if (Array.isArray(data)) {
                // Map to Polygon format somewhat: { c: close, ... }
                return data.map((d: any) => ({
                    c: d.close,
                    o: d.open,
                    h: d.high,
                    l: d.low,
                    v: d.volume,
                    t: d.timestamp * 1000
                }));
            }
            return [];
        } catch (e) {
            console.error('Error fetching aggregates:', e);
            return [];
        }
    }
    // Fetch Intraday History for Sparklines and Candles
    async getStockHistory(symbol: string, range: string = '1d', interval: string = '5m'): Promise<{ timestamp: number; open: number; high: number; low: number; close: number; price: number }[]> {
        try {
            const response = await fetch(`${BACKEND_API}/history?symbol=${symbol}&range=${range}&interval=${interval}`);
            const data = await response.json();

            if (Array.isArray(data)) {
                return data.map((d: any) => ({
                    timestamp: d.timestamp * 1000, // Convert to ms
                    open: d.open,
                    high: d.high,
                    low: d.low,
                    close: d.close,
                    price: d.close // Alias for compatibility
                })).filter(d => d.open !== null && d.close !== null && d.high !== null && d.low !== null);
            }
            return [];
        } catch (error) {
            console.error('Error fetching history:', error);
            return [];
        }
    }
}

export const yahooService = new YahooService();
