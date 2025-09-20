import React from 'react';
import { mockArticles } from '../../../utils/mockData';
import ArticleCard from '../../ui/ArticleCard';
import './FeaturedArticle.css';

const FeaturedArticle: React.FC = () => {
  // Get the first article as featured
  const featuredArticle = mockArticles[0];

  return (
    <div className="featured-article">
      <ArticleCard
        article={featuredArticle}
        variant="featured"
        onClick={() => console.log('Featured article clicked:', featuredArticle.id)}
      />
    </div>
  );
};

export default FeaturedArticle;
