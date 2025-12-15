import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/yahoo';

export interface YahooSearchResult {
    symbol: string;
    shortname: string;
    longname: string;
    exchange: string;
    quoteType: string;
    price?: number;
    change?: number;
    changePercent?: number;
}

export interface YahooQuote {
    symbol: string;
    price: number;
    currency: string;
    previousClose: number;
    timestamp: number;
}

export interface YahooHistoryCandle {
    timestamp: number;
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export const yahooFinanceService = {
    /**
     * Search for stocks using Yahoo Finance API and fetch current prices
     */
    searchStocks: async (query: string): Promise<YahooSearchResult[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/search`, {
                params: { q: query }
            });
            // Backend returns { results: [...] }
            let results = response.data.results || [];

            // Enhance with prices
            if (results.length > 0) {
                const symbols = results.map((r: any) => r.symbol);
                const quotes = await yahooFinanceService.getMultipleQuotes(symbols);

                results = results.map((r: any) => {
                    const quote = quotes.find(q => q.symbol === r.symbol);
                    return {
                        ...r,
                        price: quote ? quote.price : null,
                        change: quote ? (quote.price - quote.previousClose) : null,
                        changePercent: quote ? ((quote.price - quote.previousClose) / quote.previousClose) * 100 : null

                    };
                });
            }

            return results;
        } catch (error) {
            console.error('Error searching stocks:', error);
            return [];
        }
    },

    /**
     * Get current price quote for a symbol
     */
    getStockQuote: async (symbol: string): Promise<YahooQuote | null> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/quote`, {
                params: { symbol }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching quote for ${symbol}:`, error);
            return null;
        }
    },

    /**
     * Get quotes for multiple symbols
     */
    getMultipleQuotes: async (symbols: string[]): Promise<YahooQuote[]> => {
        try {
            const promises = symbols.map(symbol => yahooFinanceService.getStockQuote(symbol));
            const results = await Promise.all(promises);
            return results.filter((quote): quote is YahooQuote => quote !== null);
        } catch (error) {
            console.error('Error fetching multiple quotes:', error);
            return [];
        }
    },
    /**
     * Get historical data for a symbol
     */
    getStockHistory: async (symbol: string, range: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y' | 'max' = '1mo', interval: '1m' | '5m' | '15m' | '1d' | '1wk' | '1mo' = '1d') => {
        try {
            const response = await axios.get(`${API_BASE_URL}/history`, {
                params: { symbol, range, interval }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching history for ${symbol}:`, error);
            return [];
        }
    }
};
