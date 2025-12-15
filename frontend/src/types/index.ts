// Article related types
export interface Article {
  id: string;
  title: string;
  description?: string;
  source: string;
  timestamp: string;
  imageUrl?: string;
  stockTicker?: string;
  stockChange?: number;
  stockChangePercent?: number;
  isPremium?: boolean;
}

// Market data types
export interface MarketIndex {
  id: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  sparklineData: number[];
}

// Stock related types
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  exch?: string;
  type?: string;
}

export interface StockTicker {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

// Navigation types
export interface NavItem {
  id: string;
  label: string;
  href: string;
  hasDropdown?: boolean;
}

// Portfolio types
export interface Portfolio {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  holdings: Stock[];
}

// Component props types
export interface ArticleCardProps {
  article: Article;
  variant?: 'featured' | 'standard' | 'compact';
  onClick?: () => void;
}

export interface MarketIndexProps {
  index: MarketIndex;
  onClick?: () => void;
}

export interface SearchBarProps {
  placeholder: string;
  onSearch: (query: string) => void;
  className?: string;
}

export interface StockTickerProps {
  ticker: StockTicker;
  showChange?: boolean;
  className?: string;
}
