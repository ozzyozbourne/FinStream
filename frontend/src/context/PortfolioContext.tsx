import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { yahooFinanceService } from '../services/yahooFinance';

export interface Holding {
    symbol: string;
    name: string;
    shares: number;
    avgPrice: number; // Cost basis per share
    currPrice: number; // Live market price
    purchaseDate?: string;
}

interface PortfolioContextType {
    holdings: Holding[];
    totalValue: number;
    totalCost: number;
    totalGain: number;
    totalGainPercent: number;
    isLoading: boolean;
    addHolding: (symbol: string, name: string, shares: number, priceAtBuy: number, date?: string) => Promise<void>;
    removeHolding: (symbol: string) => void;
    refreshPrices: () => Promise<void>;
    chartData: { timestamp: number; value: number }[];
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const STORAGE_KEY = 'finStream_portfolio_holdings';

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [holdings, setHoldings] = useState<Holding[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to load portfolio from storage', e);
            return [];
        }
    });

    const [chartData, setChartData] = useState<{ timestamp: number; value: number }[]>(() => {
        try {
            const saved = localStorage.getItem('finStream_portfolio_live_chart');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [isLoading, setIsLoading] = useState(false);

    // Derived totals
    const totalValue = holdings.reduce((sum, h) => sum + (h.currPrice * h.shares), 0);
    const totalCost = holdings.reduce((sum, h) => sum + (h.avgPrice * h.shares), 0);
    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
    }, [holdings]);

    // Track live portfolio value history
    useEffect(() => {
        if (holdings.length === 0) return;

        const now = Math.floor(Date.now() / 1000);

        setChartData(prevData => {
            // Prevent storing duplicate points (e.g. if re-renders happen quickly)
            const lastPoint = prevData[prevData.length - 1];
            // 5-second debounce window
            if (lastPoint && (now - lastPoint.timestamp < 5)) {
                return prevData;
            }

            const newData = [...prevData, { timestamp: now, value: totalValue }];

            // Improve performance by limiting history size (e.g., last 2000 points)
            if (newData.length > 2000) newData.shift();

            localStorage.setItem('finStream_portfolio_live_chart', JSON.stringify(newData));
            return newData;
        });
    }, [totalValue, holdings.length]);

    // Initial price refresh on mount and auto-refresh interval
    useEffect(() => {
        if (holdings.length > 0) {
            refreshPrices();

            const intervalId = setInterval(() => {
                refreshPrices(true);
            }, 30000); // Refresh every 30 seconds

            return () => clearInterval(intervalId);
        }
    }, [holdings.length]); // Re-setup if holdings count changes (e.g. added/removed stock)


    const refreshPrices = async (silent = false) => {
        if (holdings.length === 0) return;
        if (!silent) setIsLoading(true);
        try {
            const symbols = holdings.map(h => h.symbol);
            const quotes = await yahooFinanceService.getMultipleQuotes(symbols);

            setHoldings(prev => prev.map(holding => {
                const quote = quotes.find(q => q.symbol === holding.symbol);
                return quote ? { ...holding, currPrice: quote.price } : holding;
            }));
        } catch (error) {
            console.error('Error refreshing portfolio prices:', error);
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    const addHolding = async (symbol: string, name: string, shares: number, priceAtBuy: number, date?: string) => {
        // Check if we already own this stock
        const existingIndex = holdings.findIndex(h => h.symbol === symbol);

        if (existingIndex >= 0) {
            // Update existing holding (Weighted Average Cost Basis)
            const existing = holdings[existingIndex];
            const totalCostExisting = existing.shares * existing.avgPrice;
            const totalCostNew = shares * priceAtBuy;
            const newTotalShares = existing.shares + shares;
            const newAvgPrice = (totalCostExisting + totalCostNew) / newTotalShares;

            // Update current price from API if possible, else rely on input/existing
            let currentPrice = existing.currPrice;
            try {
                const quote = await yahooFinanceService.getStockQuote(symbol);
                if (quote) currentPrice = quote.price;
            } catch (e) {
                console.warn('Could not fetch live price for addition, using existing/input');
            }

            const updatedHolding = {
                ...existing,
                shares: newTotalShares,
                avgPrice: newAvgPrice,
                currPrice: currentPrice,
                // Keep original purchase date or update? Usually FIFO/LIFO matters but for simple view keep original or latest?
                // Let's keep original for now.
            };

            const newHoldings = [...holdings];
            newHoldings[existingIndex] = updatedHolding;
            setHoldings(newHoldings);
        } else {
            // Add new holding
            // Fetch current price immediately
            let currentPrice = priceAtBuy; // Fallback
            try {
                const quote = await yahooFinanceService.getStockQuote(symbol);
                if (quote) currentPrice = quote.price;
            } catch (e) {
                console.warn('Could not fetch live price for addition, using input price');
            }

            const newHolding: Holding = {
                symbol,
                name,
                shares,
                avgPrice: priceAtBuy,
                currPrice: currentPrice,
                purchaseDate: date
            };
            setHoldings([...holdings, newHolding]);
        }
    };

    const removeHolding = (symbol: string) => {
        setHoldings(prev => prev.filter(h => h.symbol !== symbol));
    };

    return (
        <PortfolioContext.Provider value={{
            holdings,
            totalValue,
            totalCost,
            totalGain,
            totalGainPercent,
            isLoading,
            addHolding,
            removeHolding,
            refreshPrices,
            chartData
        }}>
            {children}
        </PortfolioContext.Provider>
    );
};

export const usePortfolio = () => {
    const context = useContext(PortfolioContext);
    if (context === undefined) {
        throw new Error('usePortfolio must be used within a PortfolioProvider');
    }
    return context;
};
