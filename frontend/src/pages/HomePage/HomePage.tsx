import React from 'react';
import FeaturedArticle from '../../components/sections/FeaturedArticle';
import NewsFeed from '../../components/sections/NewsFeed';
import MarketSummary from '../../components/sections/MarketSummary';
import Portfolio from '../../components/sections/Portfolio';
import TopGainers from '../../components/sections/TopGainers';
import LatestNews from '../../components/sections/LatestNews';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <div className="home-content">
        {/* Main Content Area */}
        <div className="main-content-area">
          <div className="content-grid">
            {/* Featured Article - Large */}
            <FeaturedArticle />
            
            {/* News Feed */}
            <div className="news-feed-section">
              <NewsFeed />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="right-sidebar">
          <MarketSummary />
          <Portfolio />
          <TopGainers />
          <LatestNews />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
