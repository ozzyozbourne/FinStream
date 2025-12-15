import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { yahooFinanceService, YahooSearchResult } from '../../services/yahooFinance';
import Button from '../../components/ui/Button';
import PortfolioChart from './PortfolioChart';
import './PortfolioPage.css';

const PortfolioPage: React.FC = () => {
  const {
    holdings,
    totalValue,
    totalCost,
    totalGain,
    totalGainPercent,
    addHolding,
    removeHolding,
    refreshPrices,
    chartData,
    isLoading: isPortfolioLoading
  } = usePortfolio();

  // Local state for UI
  const [isChartLoading, setIsChartLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YahooSearchResult[]>([]);
  const [selectedStock, setSelectedStock] = useState<YahooSearchResult | null>(null);
  const [sharesInput, setSharesInput] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

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


  // --- Handlers ---

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 1) {
      setIsSearching(true);
      const results = await yahooFinanceService.searchStocks(query);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectStock = (stock: YahooSearchResult) => {
    setSelectedStock(stock);
    setSearchQuery(stock.symbol); // Show symbol in input
    setSearchResults([]); // Hide dropdown
  };

  const handleAddPosition = async () => {
    if (!selectedStock || !sharesInput) return;

    const shares = parseFloat(sharesInput);
    if (isNaN(shares) || shares <= 0) return;

    // Fetch current price
    let priceAtBuy = 0;
    try {
      const quote = await yahooFinanceService.getStockQuote(selectedStock.symbol);
      priceAtBuy = quote ? quote.price : 0;
    } catch {
      // fallback
    }

    await addHolding(
      selectedStock.symbol,
      selectedStock.shortname || selectedStock.longname || selectedStock.symbol,
      shares,
      priceAtBuy
    );

    setIsModalOpen(false);
    setSelectedStock(null);
    setSearchQuery('');
    setSharesInput('');
  };

  const handleRemovePosition = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove ${symbol} from your portfolio?`)) {
      removeHolding(symbol);
    }
  }

  // --- Performance Logic for Highlights ---
  const bestPerformer = [...holdings].sort((a, b) => {
    const gainA = (a.currPrice - a.avgPrice) / a.avgPrice;
    const gainB = (b.currPrice - b.avgPrice) / b.avgPrice;
    return gainB - gainA;
  })[0];

  const worstPerformer = [...holdings].sort((a, b) => {
    const gainA = (a.currPrice - a.avgPrice) / a.avgPrice;
    const gainB = (b.currPrice - b.avgPrice) / b.avgPrice;
    return gainA - gainB; // Ascending
  })[0];

  const largestPosition = [...holdings].sort((a, b) => {
    return (b.currPrice * b.shares) - (a.currPrice * a.shares);
  })[0];


  return (
    <div className="portfolio-page">
      <div className="portfolio-header">
        <div>
          <h1 className="portfolio-title">My Portfolio</h1>
          <p className="portfolio-subtitle">Track your investments and performance</p>
        </div>
      </div>

      <div className="portfolio-dashboard">

        {/* TOP ROW: Summary KPIs */}
        <section className="dashboard-summary">
          <div className="summary-card">
            <h3>Total Portfolio Value</h3>
            <div className="summary-value">{formatCurrency(totalValue)}</div>
            <div className={`summary-change ${totalGain >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(totalGain)} ({formatPercent(totalGainPercent)})
            </div>
          </div>

          <div className="summary-card">
            <h3>Total Gain/Loss</h3>
            <div className={`summary-value ${totalGain >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(totalGain)}
            </div>
            <div className={`summary-change ${totalGain >= 0 ? 'positive' : 'negative'}`}>
              {formatPercent(totalGainPercent)}
            </div>
          </div>

          <div className="summary-card">
            <h3>Total Cost Basis</h3>
            <div className="summary-value">{formatCurrency(totalCost)}</div>
            <div className="summary-change">Original Investment</div>
          </div>
        </section>

        {/* MIDDLE ROW: Chart & Highlights */}
        <section className="dashboard-mid-section">
          <div className="portfolio-chart-container">
            <h3>Portfolio Performance (Last 30 Days)</h3>
            <div className="chart-wrapper">
              <PortfolioChart data={chartData} isLoading={isChartLoading} />
            </div>
          </div>

          <div className="portfolio-highlights">
            <h3>Highlights</h3>
            <div className="highlights-grid">
              <div className="highlight-card">
                <span className="label">Best Performer</span>
                {bestPerformer ? (
                  <div className="highlight-content">
                    <span className="symbol">{bestPerformer.symbol}</span>
                    <span className="value positive">
                      {formatPercent(((bestPerformer.currPrice - bestPerformer.avgPrice) / bestPerformer.avgPrice) * 100)}
                    </span>
                  </div>
                ) : <span className="empty-val">-</span>}
              </div>

              <div className="highlight-card">
                <span className="label">Worst Performer</span>
                {worstPerformer ? (
                  <div className="highlight-content">
                    <span className="symbol">{worstPerformer.symbol}</span>
                    <span className="value negative">
                      {formatPercent(((worstPerformer.currPrice - worstPerformer.avgPrice) / worstPerformer.avgPrice) * 100)}
                    </span>
                  </div>
                ) : <span className="empty-val">-</span>}
              </div>

              <div className="highlight-card">
                <span className="label">Largest Position</span>
                {largestPosition ? (
                  <div className="highlight-content">
                    <span className="symbol">{largestPosition.symbol}</span>
                    <span className="value">
                      {formatCurrency(largestPosition.currPrice * largestPosition.shares)}
                    </span>
                  </div>
                ) : <span className="empty-val">-</span>}
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM ROW: Holdings Table */}
        <section className="dashboard-holdings">
          <div className="holdings-header">
            <h3>Holdings</h3>
            <div className="header-actions">
              {isPortfolioLoading && <span className="updating-indicator">Updating...</span>}
              <Button onClick={() => refreshPrices()} variant="outline" size="small" className="refresh-btn">
                ↻
              </Button>
              <Button onClick={() => setIsModalOpen(true)} size="small">
                + Add
              </Button>
            </div>
          </div>

          <div className="holdings-table-container">
            <div className="holdings-table">
              <div className="table-header">
                <div className="col-symbol">Symbol</div>
                <div className="col-shares">Shares</div>
                <div className="col-price">Avg Price</div>
                <div className="col-current">Current</div>
                <div className="col-value">Value</div>
                <div className="col-gain">Gain/Loss</div>
                <div className="col-actions">Actions</div>
              </div>

              {holdings.length === 0 ? (
                <div className="empty-table-row">No holdings found.</div>
              ) : (
                holdings.map((item) => {
                  const marketValue = item.shares * item.currPrice;
                  const gainABC = marketValue - (item.shares * item.avgPrice);
                  const gainPercent = item.avgPrice > 0 ? (gainABC / (item.shares * item.avgPrice)) * 100 : 0;

                  return (
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
                        <div className="current-price">{formatCurrency(item.currPrice)}</div>
                      </div>
                      <div className="col-value">{formatCurrency(marketValue)}</div>
                      <div className="col-gain">
                        <div className={`gain-loss ${gainABC >= 0 ? 'positive' : 'negative'}`}>
                          {formatCurrency(gainABC)}
                        </div>
                        <div className={`gain-percent ${gainABC >= 0 ? 'positive' : 'negative'}`}>
                          {formatPercent(gainPercent)}
                        </div>
                      </div>
                      <div className="col-actions">
                        <button className="remove-btn" onClick={(e) => handleRemovePosition(item.symbol, e)}>×</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

      </div>

      {/* --- Add Position Modal (Same as before) --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Position</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">

              <div className="form-group">
                <label>Stock Symbol</label>
                <input
                  type="text"
                  placeholder="Search (e.g. AAPL)"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {searchResults.length > 0 && (
                  <div className="search-dropdown-pf">
                    {searchResults.map(result => (
                      <div key={result.symbol} className="search-item" onClick={() => handleSelectStock(result)}>
                        <span className="item-symbol">{result.symbol}</span>
                        <span className="item-name">{result.shortname || result.longname}</span>
                        {result.price !== undefined && (
                          <span className={`item-price ${result.change && result.change >= 0 ? 'positive' : 'negative'}`}>
                            ${result.price.toFixed(2)}
                          </span>
                        )}
                        <span className="item-exch">{result.exchange}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Shares</label>
                <input
                  type="number"
                  placeholder="0"
                  value={sharesInput}
                  onChange={(e) => setSharesInput(e.target.value)}
                />
              </div>

              {selectedStock && (
                <div className="selected-preview">
                  <p>Adding: <strong>{selectedStock.symbol}</strong></p>
                </div>
              )}

              <Button
                className="full-width-btn"
                disabled={!selectedStock || !sharesInput}
                onClick={handleAddPosition}
              >
                Add to Portfolio
              </Button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;
