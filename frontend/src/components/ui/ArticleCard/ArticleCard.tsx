import React from 'react';
import { ArticleCardProps } from '../../../types';
import StockTicker from '../StockTicker';
import './ArticleCard.css';

const ArticleCard: React.FC<ArticleCardProps> = 
({ 
  article, 
  variant = 'standard', 
  onClick 
}) => {
  const { 
    title, 
    description,  
    urlToImage: imageUrl, 
    stockTicker, 
    stockChange, 
    stockChangePercent,
  } = (article as any) || {};



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
            price: 0,
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
  
  if (!article) return null; // Safety check

  return (
    <article className={`article-card article-card--${variant} ${onClick ? 'clickable' : ''}`}
      onClick={handleClick}>
      <div className="article-content">
        <h3 className="article-title">{title}</h3>
        
        {/* 4. FIX: Image Block - Only render if imageUrl exists AND the variant is "featured" */}
        {imageUrl && variant === 'featured' && (
          <div className="article-image">
            <img src={imageUrl} alt={title || 'Article image'} />
          </div>
        )}
        
        {description && variant !== 'compact' && (
          <p className="article-description">{description}</p>
        )}
        <div className="article-meta">
          <div className="article-source-info">
            <span className="article-source">{(article as any)?.source?.name}</span> 
          </div>
          {renderStockTicker()}
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;