import React, { useState, useEffect } from 'react';
import { polygonService } from '../../services/polygonService';
import Button from '../../components/ui/Button';
import SparklineChart from '../../components/ui/SparklineChart';
import './PortfolioPage.css';

interface PortfolioItem {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  sparklineData: number[];
}

interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

const PortfolioPage: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'holdings' | 'performance'>('overview');

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setIsLoading(true);
      
      // Mock portfolio data
      const mockPortfolio: PortfolioItem[] = [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          shares: 50,
          avgPrice: 175.00,
          currentPrice: 189.45,
          marketValue: 9472.50,
          gainLoss: 722.50,
          gainLossPercent: 8.26,
          dayChange: 117.00,
          dayChangePercent: 1.25,
          sparklineData: Array.from({ length: 30 }, () => Math.random() * 20 + 170)
        },
        {
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          shares: 25,
          avgPrice: 350.00,
          currentPrice: 378.90,
          marketValue: 9472.50,
          gainLoss: 722.50,
          gainLossPercent: 8.26,
          dayChange: -30.75,
          dayChangePercent: -0.32,
          sparklineData: Array.from({ length: 30 }, () => Math.random() * 20 + 360)
        },
        {
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          shares: 20,
          avgPrice: 140.00,
          currentPrice: 145.67,
          marketValue: 2913.40,
          gainLoss: 113.40,
          gainLossPercent: 4.05,
          dayChange: 69.00,
          dayChangePercent: 2.42,
          sparklineData: Array.from({ length: 30 }, () => Math.random() * 15 + 135)
        },
        {
          symbol: 'TSLA',
          name: 'Tesla Inc.',
          shares: 10,
          avgPrice: 250.00,
          currentPrice: 267.45,
          marketValue: 2674.50,
          gainLoss: 174.50,
          gainLossPercent: 6.98,
          dayChange: 189.00,
          dayChangePercent: 7.60,
          sparklineData: Array.from({ length: 30 }, () => Math.random() * 30 + 240)
        },
        {
          symbol: 'NVDA',
          name: 'NVIDIA Corporation',
          shares: 5,
          avgPrice: 450.00,
          currentPrice: 485.67,
          marketValue: 2428.35,
          gainLoss: 178.35,
          gainLossPercent: 7.93,
          dayChange: 226.15,
          dayChangePercent: 10.28,
          sparklineData: Array.from({ length: 30 }, () => Math.random() * 40 + 440)
        }
      ];

      setPortfolio(mockPortfolio);

      // Calculate portfolio summary
      const totalValue = mockPortfolio.reduce((sum, item) => sum + item.marketValue, 0);
      const totalCost = mockPortfolio.reduce((sum, item) => sum + (item.shares * item.avgPrice), 0);
      const totalGainLoss = totalValue - totalCost;
      const totalGainLossPercent = (totalGainLoss / totalCost) * 100;
      const dayChange = mockPortfolio.reduce((sum, item) => sum + item.dayChange, 0);
      const dayChangePercent = (dayChange / (totalValue - dayChange)) * 100;

      setSummary({
        totalValue,
        totalCost,
        totalGainLoss,
        totalGainLossPercent,
        dayChange,
        dayChangePercent
      });

    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const renderOverview = () => (
    <div className="overview-section">
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Portfolio Value</h3>
          <div className="summary-value">{formatCurrency(summary?.totalValue || 0)}</div>
          <div className={`summary-change ${(summary?.dayChange || 0) >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(summary?.dayChange || 0)} ({formatPercent(summary?.dayChangePercent || 0)})
          </div>
        </div>

        <div className="summary-card">
          <h3>Total Gain/Loss</h3>
          <div className={`summary-value ${(summary?.totalGainLoss || 0) >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(summary?.totalGainLoss || 0)}
          </div>
          <div className={`summary-change ${(summary?.totalGainLoss || 0) >= 0 ? 'positive' : 'negative'}`}>
            {formatPercent(summary?.totalGainLossPercent || 0)}
          </div>
        </div>

        <div className="summary-card">
          <h3>Total Cost Basis</h3>
          <div className="summary-value">{formatCurrency(summary?.totalCost || 0)}</div>
          <div className="summary-change">Original Investment</div>
        </div>
      </div>

      <div className="portfolio-chart">
        <h3>Portfolio Performance (30 Days)</h3>
        <div className="chart-container">
          <SparklineChart data={Array.from({ length: 30 }, () => Math.random() * 1000 + 25000)} />
        </div>
      </div>
    </div>
  );

  const renderHoldings = () => (
    <div className="holdings-section">
      <div className="holdings-header">
        <h3>Your Holdings</h3>
        <Button variant="outline" size="small">
          Add Position
        </Button>
      </div>
      
      <div className="holdings-table">
        <div className="table-header">
          <div className="col-symbol">Symbol</div>
          <div className="col-shares">Shares</div>
          <div className="col-price">Avg Price</div>
          <div className="col-current">Current</div>
          <div className="col-value">Market Value</div>
          <div className="col-gain">Gain/Loss</div>
          <div className="col-chart">Chart</div>
        </div>
        
        {portfolio.map((item, index) => (
          <div key={item.symbol} className="table-row">
            <div className="col-symbol">
              <div className="symbol-info">
                <span className="symbol">{item.symbol}</span>
                <span className="name">{item.name}</span>
              </div>
            </div>
            <div className="col-shares">{item.shares}</div>
            <div className="col-price">{formatCurrency(item.avgPrice)}</div>
            <div className="col-current">
              <div className="current-price">{formatCurrency(item.currentPrice)}</div>
              <div className={`day-change ${item.dayChange >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(item.dayChange)} ({formatPercent(item.dayChangePercent)})
              </div>
            </div>
            <div className="col-value">{formatCurrency(item.marketValue)}</div>
            <div className="col-gain">
              <div className={`gain-loss ${item.gainLoss >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(item.gainLoss)}
              </div>
              <div className={`gain-percent ${item.gainLoss >= 0 ? 'positive' : 'negative'}`}>
                {formatPercent(item.gainLossPercent)}
              </div>
            </div>
            <div className="col-chart">
              <div className="mini-chart">
                <SparklineChart data={item.sparklineData} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="performance-section">
      <h3>Performance Analysis</h3>
      <div className="performance-grid">
        <div className="performance-card">
          <h4>Best Performer</h4>
          <div className="performer-info">
            <span className="symbol">NVDA</span>
            <span className="performance positive">+10.28%</span>
          </div>
        </div>
        
        <div className="performance-card">
          <h4>Worst Performer</h4>
          <div className="performer-info">
            <span className="symbol">MSFT</span>
            <span className="performance negative">-0.32%</span>
          </div>
        </div>
        
        <div className="performance-card">
          <h4>Largest Position</h4>
          <div className="performer-info">
            <span className="symbol">AAPL</span>
            <span className="value">{formatCurrency(9472.50)}</span>
          </div>
        </div>
        
        <div className="performance-card">
          <h4>Portfolio Beta</h4>
          <div className="performer-info">
            <span className="beta">1.15</span>
            <span className="description">Moderate Risk</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="portfolio-page">
      <div className="portfolio-header">
        <h1 className="portfolio-title">My Portfolio</h1>
        <p className="portfolio-subtitle">Track your investments and performance</p>
      </div>

      <div className="portfolio-nav">
        <button
          className={`nav-btn ${selectedView === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedView('overview')}
        >
          Overview
        </button>
        <button
          className={`nav-btn ${selectedView === 'holdings' ? 'active' : ''}`}
          onClick={() => setSelectedView('holdings')}
        >
          Holdings
        </button>
        <button
          className={`nav-btn ${selectedView === 'performance' ? 'active' : ''}`}
          onClick={() => setSelectedView('performance')}
        >
          Performance
        </button>
      </div>

      <div className="portfolio-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading portfolio...</p>
          </div>
        ) : (
          <>
            {selectedView === 'overview' && renderOverview()}
            {selectedView === 'holdings' && renderHoldings()}
            {selectedView === 'performance' && renderPerformance()}
          </>
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;
