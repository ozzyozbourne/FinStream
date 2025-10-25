import React, { useState, useEffect } from 'react';
import { polygonService } from '../../services/polygonService';
import ArticleCard from '../../components/ui/ArticleCard';
import SearchBar from '../../components/ui/SearchBar';
import Button from '../../components/ui/Button';
import './NewsPage.css';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  source: string;
  timestamp: string;
  imageUrl?: string;
  stockTicker?: string;
  stockChange?: number;
  stockChangePercent?: number;
  isPremium?: boolean;
}

const NewsPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All News' },
    { id: 'market', label: 'Market News' },
    { id: 'earnings', label: 'Earnings' },
    { id: 'ipo', label: 'IPO' },
    { id: 'mergers', label: 'M&A' }
  ];

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchQuery, selectedCategory]);

  const loadNews = async () => {
    try {
      setIsLoading(true);
      
      // Mock news data with some real stock tickers
      const mockNews: NewsArticle[] = [
        {
          id: '1',
          title: 'Apple Reports Strong Q4 Earnings, Stock Surges 5%',
          description: 'Apple Inc. reported better-than-expected quarterly earnings, driven by strong iPhone sales and services revenue growth.',
          source: 'Reuters',
          timestamp: '2h ago',
          imageUrl: '/api/placeholder/400/250',
          stockTicker: 'AAPL',
          stockChange: 8.45,
          stockChangePercent: 4.8
        },
        {
          id: '2',
          title: 'Tesla Announces New Gigafactory in Texas',
          description: 'Tesla plans to build a new manufacturing facility in Austin, Texas, creating thousands of jobs.',
          source: 'Bloomberg',
          timestamp: '4h ago',
          imageUrl: '/api/placeholder/400/250',
          stockTicker: 'TSLA',
          stockChange: 12.30,
          stockChangePercent: 2.1
        },
        {
          id: '3',
          title: 'Microsoft Cloud Revenue Exceeds Expectations',
          description: 'Microsoft Azure and Office 365 continue to drive strong growth in the cloud computing sector.',
          source: 'CNBC',
          timestamp: '6h ago',
          imageUrl: '/api/placeholder/400/250',
          stockTicker: 'MSFT',
          stockChange: -2.15,
          stockChangePercent: -0.6
        },
        {
          id: '4',
          title: 'Federal Reserve Signals Potential Rate Cut',
          description: 'The Fed hints at possible interest rate adjustments in response to economic indicators.',
          source: 'Wall Street Journal',
          timestamp: '8h ago',
          imageUrl: '/api/placeholder/400/250'
        },
        {
          id: '5',
          title: 'Google Parent Alphabet Reports Record Revenue',
          description: 'Alphabet Inc. posts record quarterly revenue driven by strong advertising growth.',
          source: 'Financial Times',
          timestamp: '10h ago',
          imageUrl: '/api/placeholder/400/250',
          stockTicker: 'GOOGL',
          stockChange: 15.75,
          stockChangePercent: 1.2
        },
        {
          id: '6',
          title: 'Amazon Expands Prime Delivery Network',
          description: 'Amazon announces expansion of its same-day delivery service to 50 new cities.',
          source: 'MarketWatch',
          timestamp: '12h ago',
          imageUrl: '/api/placeholder/400/250',
          stockTicker: 'AMZN',
          stockChange: 22.40,
          stockChangePercent: 1.8
        }
      ];

      setArticles(mockNews);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(selectedCategory) ||
        article.description.toLowerCase().includes(selectedCategory)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.source.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredArticles(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="news-page">
      <div className="news-header">
        <h1 className="news-title">Financial News</h1>
        <p className="news-subtitle">Stay updated with the latest market news and analysis</p>
      </div>

      <div className="news-controls">
        <div className="search-section">
          <SearchBar
            placeholder="Search news articles..."
            onSearch={handleSearch}
            className="news-search"
          />
        </div>

        <div className="category-filters">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'primary' : 'outline'}
              size="small"
              onClick={() => setSelectedCategory(category.id)}
              className="category-button"
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="news-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading latest news...</p>
          </div>
        ) : (
          <div className="articles-grid">
            {filteredArticles.map((article, index) => (
              <div key={article.id} className={`article-item ${index === 0 ? 'featured' : ''}`}>
                <ArticleCard
                  article={article}
                  variant={index === 0 ? 'featured' : 'standard'}
                />
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredArticles.length === 0 && (
          <div className="no-results">
            <p>No articles found matching your criteria.</p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
