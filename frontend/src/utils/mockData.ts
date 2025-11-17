import {  MarketIndex, Stock } from '../types';


// Mock Market Indices
export const mockMarketIndices: MarketIndex[] = [
  {
    id: 'sp500',
    name: 'S&P 500',
    value: 6664.36,
    change: 32.40,
    changePercent: 0.49,
    sparklineData: [6630, 6645, 6650, 6655, 6660, 6665, 6664]
  },
  {
    id: 'dow30',
    name: 'Dow 30',
    value: 46315.27,
    change: 172.85,
    changePercent: 0.37,
    sparklineData: [46140, 46200, 46250, 46300, 46320, 46315, 46315]
  },
  {
    id: 'nasdaq',
    name: 'Nasdaq',
    value: 22631.48,
    change: 160.75,
    changePercent: 0.72,
    sparklineData: [22470, 22500, 22550, 22600, 22630, 22635, 22631]
  },
  {
    id: 'russell2000',
    name: 'Russell 2000',
    value: 2448.77,
    change: -18.93,
    changePercent: -0.77,
    sparklineData: [2468, 2460, 2455, 2450, 2445, 2450, 2449]
  },
  {
    id: 'vix',
    name: 'VIX',
    value: 15.45,
    change: -0.25,
    changePercent: -1.59,
    sparklineData: [15.7, 15.6, 15.5, 15.4, 15.45, 15.45, 15.45]
  },
  {
    id: 'gold',
    name: 'Gold',
    value: 3705.80,
    change: 27.50,
    changePercent: 0.75,
    sparklineData: [3678, 3685, 3690, 3695, 3700, 3705, 3706]
  }
];

// Mock Top Gainers
export const mockTopGainers: Stock[] = [
  {
    symbol: 'OKLO',
    name: 'Oklo Inc.',
    price: 135.23,
    change: 30.26,
    changePercent: 28.83
  },
  {
    symbol: 'BHF',
    name: 'Brighthouse Financial',
    price: 57.59,
    change: 12.33,
    changePercent: 27.24
  },
  {
    symbol: 'QUBT',
    name: 'Quantum Computing',
    price: 23.27,
    change: 4.92,
    changePercent: 26.81
  },
  {
    symbol: 'MENS',
    name: 'Mens Wearhouse',
    price: 65.62,
    change: 8.45,
    changePercent: 14.78
  },
   {
    symbol: 'WOMENS',
    name: 'Mens Wearhouse',
    price: 65.62,
    change: 8.45,
    changePercent: 14.78
  },
   {
    symbol: 'MENS',
    name: 'Mens Wearhouse',
    price: 65.62,
    change: 8.45,
    changePercent: 14.78
  }
];

// Mock Navigation Items
export const mockNavItems = [
  { id: 'my-portfolio', label: 'My Portfolio', href: '/portfolio' },
  { id: 'dashboard', label: 'Custom Dashboard', href: '/dashboard' },
  { id: 'markets', label: 'Markets', href: '/markets' },
  { id: 'personal-finance', label: 'Personal Finance', href: '/personal-finance' },
];
