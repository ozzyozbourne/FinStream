import React, { useState, useEffect } from 'react';
import { polygonService } from '../../services/polygonService';
import SearchBar from '../../components/ui/SearchBar';
import Button from '../../components/ui/Button';
import SparklineChart from '../../components/ui/SparklineChart';
import './ResearchPage.css';

interface StockAnalysis {
  symbol: string;
  name: string;
  currentPrice: number;
  targetPrice: number;
  recommendation: 'Buy' | 'Hold' | 'Sell';
  confidence: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  eps: number;
  dividend: number;
  yield: number;
  beta: number;
  rsi: number;
  macd: number;
  support: number;
  resistance: number;
  chartData: number[];
}

interface ResearchReport {
  id: string;
  title: string;
  symbol: string;
  analyst: string;
  date: string;
  summary: string;
  rating: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  targetPrice: number;
  currentPrice: number;
}

const ResearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockAnalysis[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockAnalysis | null>(null);
  const [researchReports, setResearchReports] = useState<ResearchReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  useEffect(() => {
    loadResearchReports();
  }, []);

  const loadResearchReports = async () => {
    try {
      setIsLoadingReports(true);
      
      // Mock research reports
      const mockReports: ResearchReport[] = [
        {
          id: '1',
          title: 'Apple Inc. - Strong iPhone 15 Sales Drive Q4 Growth',
          symbol: 'AAPL',
          analyst: 'John Smith, Senior Analyst',
          date: '2024-01-15',
          summary: 'Apple reported strong Q4 earnings with iPhone 15 sales exceeding expectations. Services revenue continues to grow at double-digit rates.',
          rating: 'Buy',
          targetPrice: 220.00,
          currentPrice: 189.45
        },
        {
          id: '2',
          title: 'Tesla - EV Market Leadership Maintained',
          symbol: 'TSLA',
          analyst: 'Sarah Johnson, EV Specialist',
          date: '2024-01-14',
          summary: 'Tesla maintains its leadership in the EV market with strong delivery numbers and expanding Supercharger network.',
          rating: 'Hold',
          targetPrice: 280.00,
          currentPrice: 267.45
        },
        {
          id: '3',
          title: 'Microsoft - Azure Growth Accelerates',
          symbol: 'MSFT',
          analyst: 'Michael Chen, Cloud Analyst',
          date: '2024-01-13',
          summary: 'Microsoft Azure continues to gain market share in cloud computing with strong enterprise adoption.',
          rating: 'Buy',
          targetPrice: 420.00,
          currentPrice: 378.90
        },
        {
          id: '4',
          title: 'NVIDIA - AI Chip Demand Remains Strong',
          symbol: 'NVDA',
          analyst: 'David Wilson, Semiconductor Analyst',
          date: '2024-01-12',
          summary: 'NVIDIA continues to benefit from strong demand for AI chips with data center revenue growing rapidly.',
          rating: 'Strong Buy',
          targetPrice: 550.00,
          currentPrice: 485.67
        }
      ];

      setResearchReports(mockReports);
    } catch (error) {
      console.error('Error loading research reports:', error);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      try {
        // Mock stock analysis data
        const mockAnalysis: StockAnalysis[] = [
          {
            symbol: query.toUpperCase(),
            name: `${query.toUpperCase()} Corporation`,
            currentPrice: Math.random() * 500 + 50,
            targetPrice: Math.random() * 600 + 60,
            recommendation: ['Buy', 'Hold', 'Sell'][Math.floor(Math.random() * 3)] as 'Buy' | 'Hold' | 'Sell',
            confidence: Math.floor(Math.random() * 40) + 60,
            priceChange: (Math.random() - 0.5) * 20,
            priceChangePercent: (Math.random() - 0.5) * 10,
            volume: Math.floor(Math.random() * 10000000),
            marketCap: Math.floor(Math.random() * 1000000000000),
            pe: Math.random() * 30 + 10,
            eps: Math.random() * 10 + 1,
            dividend: Math.random() * 5,
            yield: Math.random() * 4,
            beta: Math.random() * 2 + 0.5,
            rsi: Math.random() * 100,
            macd: (Math.random() - 0.5) * 5,
            support: Math.random() * 400 + 50,
            resistance: Math.random() * 500 + 100,
            chartData: Array.from({ length: 30 }, () => Math.random() * 100 + 200)
          }
        ];
        setSearchResults(mockAnalysis);
      } catch (error) {
        console.error('Error searching stocks:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setSelectedStock(null);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Buy':
      case 'Strong Buy':
        return '#00d4aa';
      case 'Hold':
        return '#ffa726';
      case 'Sell':
      case 'Strong Sell':
        return '#ff4757';
      default:
        return '#a0a0a0';
    }
  };

  const getRSIColor = (rsi: number) => {
    if (rsi > 70) return '#ff4757'; // Overbought
    if (rsi < 30) return '#00d4aa'; // Oversold
    return '#a0a0a0'; // Neutral
  };

  return (
    <div className="research-page">
      <div className="research-header">
        <h1 className="research-title">Research & Analysis</h1>
        <p className="research-subtitle">Professional stock analysis and research reports</p>
      </div>

      <div className="research-content">
        <div className="research-main">
          <div className="search-section">
            <SearchBar
              placeholder="Search for stock analysis..."
              onSearch={handleSearch}
              className="research-search"
            />
          </div>

          {searchQuery && (
            <div className="search-results">
              <h2>Analysis Results</h2>
              {isSearching ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Analyzing stock data...</p>
                </div>
              ) : (
                <div className="analysis-grid">
                  {searchResults.map((stock, index) => (
                    <div key={index} className="analysis-card" onClick={() => setSelectedStock(stock)}>
                      <div className="analysis-header">
                        <h3>{stock.symbol}</h3>
                        <span className="stock-name">{stock.name}</span>
                      </div>
                      <div className="analysis-price">
                        <span className="current-price">${stock.currentPrice.toFixed(2)}</span>
                        <div className={`price-change ${stock.priceChange >= 0 ? 'positive' : 'negative'}`}>
                          {stock.priceChange >= 0 ? '+' : ''}{stock.priceChange.toFixed(2)} ({stock.priceChangePercent >= 0 ? '+' : ''}{stock.priceChangePercent.toFixed(2)}%)
                        </div>
                      </div>
                      <div className="analysis-recommendation">
                        <span 
                          className="recommendation-badge"
                          style={{ backgroundColor: getRecommendationColor(stock.recommendation) }}
                        >
                          {stock.recommendation}
                        </span>
                        <span className="confidence">{stock.confidence}% confidence</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedStock && (
            <div className="detailed-analysis">
              <h2>Detailed Analysis - {selectedStock.symbol}</h2>
              <div className="analysis-details">
                <div className="detail-section">
                  <h3>Price Analysis</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Current Price:</span>
                      <span className="value">${selectedStock.currentPrice.toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Target Price:</span>
                      <span className="value">${selectedStock.targetPrice.toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Support:</span>
                      <span className="value">${selectedStock.support.toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Resistance:</span>
                      <span className="value">${selectedStock.resistance.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Technical Indicators</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">RSI (14):</span>
                      <span className="value" style={{ color: getRSIColor(selectedStock.rsi) }}>
                        {selectedStock.rsi.toFixed(1)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">MACD:</span>
                      <span className="value">{selectedStock.macd.toFixed(3)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Beta:</span>
                      <span className="value">{selectedStock.beta.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Fundamentals</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">P/E Ratio:</span>
                      <span className="value">{selectedStock.pe.toFixed(1)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">EPS:</span>
                      <span className="value">${selectedStock.eps.toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Dividend:</span>
                      <span className="value">${selectedStock.dividend.toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Yield:</span>
                      <span className="value">{selectedStock.yield.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                <div className="chart-section">
                  <h3>Price Chart (30 Days)</h3>
                  <div className="chart-container">
                    <SparklineChart data={selectedStock.chartData} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="research-sidebar">
          <div className="reports-section">
            <h2>Latest Research Reports</h2>
            {isLoadingReports ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading reports...</p>
              </div>
            ) : (
              <div className="reports-list">
                {researchReports.map((report) => (
                  <div key={report.id} className="report-card">
                    <div className="report-header">
                      <h4>{report.symbol}</h4>
                      <span 
                        className="rating-badge"
                        style={{ backgroundColor: getRecommendationColor(report.rating) }}
                      >
                        {report.rating}
                      </span>
                    </div>
                    <h5 className="report-title">{report.title}</h5>
                    <p className="report-summary">{report.summary}</p>
                    <div className="report-footer">
                      <span className="analyst">{report.analyst}</span>
                      <span className="date">{new Date(report.date).toLocaleDateString()}</span>
                    </div>
                    <div className="report-target">
                      <span>Target: ${report.targetPrice.toFixed(2)}</span>
                      <span>Current: ${report.currentPrice.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchPage;
