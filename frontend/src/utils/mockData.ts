import { Article, MarketIndex, Stock } from '../types';

// Mock Articles
export const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Adjustable-rate mortgages make a comeback as buyers seek lower rates',
    description: 'Homebuyers are increasingly turning to adjustable-rate mortgages as they look for ways to reduce their monthly payments in a high-rate environment.',
    source: 'Yahoo Finance',
    timestamp: '4h ago',
    imageUrl: '/api/placeholder/400/250',
    stockTicker: 'PFSI',
    stockChange: -1.66,
    stockChangePercent: -1.66
  },
  {
    id: '2',
    title: 'Traveling this fall? Here are expert tips to score the best deals',
    description: 'Travel experts share their best strategies for finding affordable flights, hotels, and vacation packages this autumn.',
    source: 'Travel Weekly',
    timestamp: '6h ago',
    imageUrl: '/api/placeholder/300/200'
  },
  {
    id: '3',
    title: 'What to know about the FAFSA for the 2026-27 school year',
    description: 'Important updates and deadlines for the Free Application for Federal Student Aid.',
    source: 'Education News',
    timestamp: '8h ago'
  },
  {
    id: '4',
    title: 'Trump officials blocked US Steel from stopping work at plant',
    description: 'Former administration officials intervened to prevent US Steel from halting operations at a key manufacturing facility.',
    source: 'Reuters',
    timestamp: '10h ago'
  },
  {
    id: '5',
    title: 'Mortgage rates ticked up after the Fed cut, following a familiar path',
    description: 'Interest rates on home loans increased slightly following the Federal Reserve\'s latest rate decision.',
    source: 'MarketWatch',
    timestamp: '12h ago'
  },
  {
    id: '6',
    title: 'Trump unveils gold, platinum visas to cost up to $5 million',
    description: 'New premium visa categories announced with significant investment requirements.',
    source: 'Immigration News',
    timestamp: '14h ago'
  },
  {
    id: '7',
    title: 'GOP, Democrats continue to disagree on government funding plan',
    description: 'Congressional negotiations on federal budget allocation remain at an impasse.',
    source: 'Political News',
    timestamp: '16h ago'
  },
  {
    id: '8',
    title: 'How a government shutdown would',
    description: 'Analysis of potential impacts and consequences of a federal government shutdown.',
    source: 'Policy Review',
    timestamp: '18h ago',
    imageUrl: '/api/placeholder/300/200'
  },
  {
    id: '9',
    title: 'The stock market finally has what it',
    description: 'Market analysts discuss recent developments and their implications for investors.',
    source: 'Financial Times',
    timestamp: '20h ago',
    imageUrl: '/api/placeholder/300/200'
  },
  {
    id: '10',
    title: 'TikTok Deal Gives Americans 6 of 7 Board Seats, Leavitt Says',
    description: 'Details emerge about the proposed TikTok acquisition and board composition.',
    source: 'Tech News',
    timestamp: '22h ago',
    isPremium: true
  },
  {
    id: '11',
    title: 'Updates to Studio, YouTube Live, new gen AI tools, and everything else announced at Made on YouTube',
    description: 'Comprehensive overview of YouTube\'s latest platform updates and new features.',
    source: 'YouTube Blog',
    timestamp: '1d ago',
    isPremium: true
  },
  {
    id: '12',
    title: 'Stock Market Rally Risks Losing Steam as Economic Bounce Fades',
    description: 'Concerns grow about the sustainability of recent market gains as economic indicators show mixed signals.',
    source: 'Bloomberg',
    timestamp: '1d ago'
  }
];

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
  }
];

// Mock Navigation Items
export const mockNavItems = [
  { id: 'my-portfolio', label: 'My Portfolio', href: '/portfolio' },
  { id: 'news', label: 'News', href: '/news' },
  { id: 'markets', label: 'Markets', href: '/markets' },
  { id: 'research', label: 'Research', href: '/research' },
  { id: 'personal-finance', label: 'Personal Finance', href: '/personal-finance' },
  { id: 'videos', label: 'Videos', href: '/videos' },
  { id: 'watch-now', label: 'Watch Now', href: '/watch' }
];
