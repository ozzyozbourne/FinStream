import React from 'react';
import { mockArticles } from '../../../utils/mockData';
import ArticleCard from '../../ui/ArticleCard';
import './NewsFeed.css';

const NewsFeed: React.FC = () => {
  // Get articles 2-9 for the news feed (excluding featured and latest)
  const newsArticles = mockArticles.slice(1, 9);

  return (
    <div className="news-feed">
      <div className="news-articles">
        {newsArticles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            variant="standard"
            onClick={() => console.log('News article clicked:', article.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
