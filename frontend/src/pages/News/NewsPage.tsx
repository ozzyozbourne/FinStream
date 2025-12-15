import React, { useState, useEffect } from 'react';
import ArticleCard from '../../components/ui/ArticleCard';
import SearchBar from '../../components/ui/SearchBar';
import Button from '../../components/ui/Button';
import { newsService, NewsArticle } from '../../services/newsService';
import { usePortfolio } from '../../context/PortfolioContext';
import EmailSubscriptionModal from '../../components/features/News/EmailSubscriptionModal';
import './NewsPage.css';

const NewsPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'market' | 'portfolio'>('market');
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const { holdings } = usePortfolio();

  useEffect(() => {
    loadNews();
  }, [activeTab]); // Reload when tab changes

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // If query is empty, reload default news. If has value, search.
    loadNews(query);
  };

  // Modify loadNews to accept optional query override
  const loadNews = async (queryOverride?: string) => {
    try {
      setIsLoading(true);
      let news: NewsArticle[] = [];

      // If explicit search query (from search bar)
      if (queryOverride) {
        news = await newsService.getNews(queryOverride);
      }
      // Else use tabs
      else if (activeTab === 'portfolio') {
        if (holdings.length > 0) {
          const symbols = holdings.map(h => h.symbol);
          news = await newsService.getNews(symbols);
        } else {
          news = [];
        }
      } else {
        // General market news
        news = await newsService.getNews([]);
      }

      setArticles(news);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="news-page">
      <div className="news-header-container">
        <div className="news-header">
          <h1 className="news-title">Financial News</h1>
          <p className="news-subtitle">Live market updates and portfolio insights</p>
        </div>

        <div className="news-actions">
          <Button
            variant="primary"
            onClick={() => setIsSubscriptionModalOpen(true)}
            className="subscribe-button-header"
          >
            Get Daily Alerts
          </Button>
        </div>
      </div>

      <div className="news-controls">
        <div className="category-tabs">
          <Button
            variant={activeTab === 'market' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('market')}
          >
            Market News
          </Button>
          <Button
            variant={activeTab === 'portfolio' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('portfolio')}
          >
            My Portfolio News
          </Button>
        </div>

        <div className="search-section">
          <SearchBar
            placeholder="Search headlines..."
            onSearch={handleSearch}
            className="news-search"
          />
        </div>
      </div>

      <div className="news-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading {activeTab} news...</p>
          </div>
        ) : (
          <div className="articles-grid">
            {articles.length > 0 ? (
              articles.map((article, index) => (
                <div key={article.id || index} className="article-item">
                  <ArticleCard
                    article={{
                      ...article,
                      timestamp: article.timestamp ? new Date(article.timestamp * 1000).toLocaleString() : 'Just now'
                    }}
                    variant="standard"
                  />
                </div>
              ))
            ) : (
              <div className="no-results">
                {activeTab === 'portfolio' && holdings.length === 0 ? (
                  <p>Add stocks to your portfolio to see personalized news.</p>
                ) : (
                  <p>No articles found.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isSubscriptionModalOpen && (
        <EmailSubscriptionModal onClose={() => setIsSubscriptionModalOpen(false)} />
      )}
    </div>
  );
};

export default NewsPage;
