import React from 'react';
import { mockArticles } from '../../../utils/mockData';
import ArticleCard from '../../ui/ArticleCard';
import './LatestNews.css';

const LatestNews: React.FC = () => {
  // Filter for premium and latest articles
  const latestArticles = mockArticles.filter(article => 
    article.isPremium || article.id === '10' || article.id === '11' || article.id === '12'
  );

  return (
    <div className="latest-news">
      <h3 className="section-title">Latest</h3>
      <div className="latest-articles">
        {latestArticles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            variant="compact"
            onClick={() => console.log('Article clicked:', article.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default LatestNews;
