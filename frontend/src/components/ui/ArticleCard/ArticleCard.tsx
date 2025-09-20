import React from 'react';
import { ArticleCardProps } from '../../../types';
import StockTicker from '../StockTicker';
import './ArticleCard.css';

const ArticleCard: React.FC<ArticleCardProps> = ({ 
  article, 
  variant = 'standard', 
  onClick 
}) => {
  const { 
    title, 
    description, 
    source, 
    timestamp, 
    imageUrl, 
    stockTicker, 
    stockChange, 
    stockChangePercent,
    isPremium 
  } = article;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const renderStockTicker = () => {
    if (stockTicker && stockChange !== undefined && stockChangePercent !== undefined) {
      return (
        <StockTicker
          ticker={{
            symbol: stockTicker,
            price: 0, // We'll use a placeholder since we only have change data
            change: stockChange,
            changePercent: stockChangePercent
          }}
          showChange={true}
          className="inline"
        />
      );
    }
    return null;
  };

  return (
    <article 
      className={`article-card article-card--${variant} ${onClick ? 'clickable' : ''}`}
      onClick={handleClick}
    >
      {imageUrl && (
        <div className="article-image">
          <img src={imageUrl} alt={title} />
          {isPremium && <span className="premium-badge">PREMIUM</span>}
        </div>
      )}
      
      <div className="article-content">
        <h3 className="article-title">{title}</h3>
        
        {description && variant !== 'compact' && (
          <p className="article-description">{description}</p>
        )}
        
        <div className="article-meta">
          <div className="article-source-info">
            <span className="article-source">{source}</span>
            <span className="article-timestamp">{timestamp}</span>
          </div>
          {renderStockTicker()}
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
