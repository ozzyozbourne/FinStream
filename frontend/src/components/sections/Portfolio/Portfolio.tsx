import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../ui/Button';
import { usePortfolio } from '../../../context/PortfolioContext';
import PortfolioChart from '../../../pages/Portfolio/PortfolioChart';
import './Portfolio.css';

const Portfolio: React.FC = () => {
  const navigate = useNavigate();
  const { holdings, totalValue, totalGain, totalGainPercent, chartData } = usePortfolio();

  const handleSignIn = () => {
    console.log('Portfolio sign in clicked');
    // For now, redirect to portfolio page as "sign in" simulation or existing user flow
    navigate('/portfolio');
  };

  const hasHoldings = holdings.length > 0;

  return (
    <div className="portfolio">
      <div className="portfolio-header">
        <h3 className="section-title">Portfolio</h3>
        {hasHoldings && (
          <button className="portfolio-arrow-btn" onClick={() => navigate('/portfolio')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </button>
        )}
      </div>

      <div className="portfolio-content">
        {!hasHoldings ? (
          <>
            <div className="portfolio-message">
              <p>Sign in to access your portfolio</p>
            </div>
            <Button
              variant="outline"
              size="small"
              onClick={handleSignIn}
              className="portfolio-signin-button"
            >
              Sign in
            </Button>
          </>
        ) : (
          <div className="portfolio-mini-view">
            <div className="portfolio-mini-stats">
              <div className="portfolio-mini-value">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue)}
              </div>
              <div className={`portfolio-mini-gain ${totalGain >= 0 ? 'positive' : 'negative'}`}>
                {totalGain >= 0 ? '+' : ''}{totalGain.toFixed(2)} ({totalGainPercent.toFixed(2)}%)
              </div>
            </div>
            <div className="portfolio-mini-chart">
              <PortfolioChart data={chartData} minimal />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
