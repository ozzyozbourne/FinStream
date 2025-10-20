import React from 'react';
import NewsFeed from '../../components/sections/NewsFeed';
import MarketSummary from '../../components/sections/MarketSummary';
import Portfolio from '../../components/sections/Portfolio';
import TopGainers from '../../components/sections/TopGainers';
import FeaturedArticle from '../../components/sections/FeaturedArticle';
import './HomePage.css';
const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <div className="home-content">
        {/* Main Content Area */}
        <div className="main-content-area">
          <div className="content-grid">
            {/* Featured Article - Large*/}
            <FeaturedArticle />
            {/* News Feed */}
            <div className="news-feed-section">
              <NewsFeed />
            </div>
             <div className="news-feed-section">
            <TopGainers />
            </div>
          </div>
        </div>
        {/* Right Sidebar */}
        <div className="right-sidebar">
          <MarketSummary />
          <Portfolio />
        </div>
      </div>
    </div>
  );
};

export default HomePage;