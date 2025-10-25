import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import './VideosPage.css';

interface VideoContent {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  views: number;
  publishDate: string;
  category: 'market-analysis' | 'tutorial' | 'news' | 'interview';
  featured: boolean;
}

const VideosPage: React.FC = () => {
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'all', label: 'All Videos' },
    { id: 'market-analysis', label: 'Market Analysis' },
    { id: 'tutorial', label: 'Tutorials' },
    { id: 'news', label: 'News' },
    { id: 'interview', label: 'Interviews' }
  ];

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setIsLoading(true);
      
      // Mock video data
      const mockVideos: VideoContent[] = [
        {
          id: '1',
          title: 'Market Analysis: Tech Stocks Rally Continues',
          description: 'In-depth analysis of the recent tech stock rally and what it means for investors.',
          thumbnail: '/api/placeholder/400/225',
          duration: '12:34',
          views: 125000,
          publishDate: '2024-01-15',
          category: 'market-analysis',
          featured: true
        },
        {
          id: '2',
          title: 'How to Read Financial Statements',
          description: 'Learn the basics of reading and understanding financial statements for better investment decisions.',
          thumbnail: '/api/placeholder/400/225',
          duration: '18:45',
          views: 89000,
          publishDate: '2024-01-14',
          category: 'tutorial',
          featured: false
        },
        {
          id: '3',
          title: 'Fed Chair Speaks on Interest Rates',
          description: 'Federal Reserve Chairman discusses the current economic outlook and potential rate changes.',
          thumbnail: '/api/placeholder/400/225',
          duration: '25:12',
          views: 210000,
          publishDate: '2024-01-13',
          category: 'news',
          featured: true
        },
        {
          id: '4',
          title: 'CEO Interview: Tesla\'s Future Plans',
          description: 'Exclusive interview with Tesla CEO about the company\'s future growth strategy.',
          thumbnail: '/api/placeholder/400/225',
          duration: '22:30',
          views: 156000,
          publishDate: '2024-01-12',
          category: 'interview',
          featured: false
        },
        {
          id: '5',
          title: 'Cryptocurrency Market Update',
          description: 'Latest updates on cryptocurrency markets and regulatory developments.',
          thumbnail: '/api/placeholder/400/225',
          duration: '15:20',
          views: 98000,
          publishDate: '2024-01-11',
          category: 'market-analysis',
          featured: false
        },
        {
          id: '6',
          title: 'Options Trading for Beginners',
          description: 'Complete guide to understanding options trading and basic strategies.',
          thumbnail: '/api/placeholder/400/225',
          duration: '28:15',
          views: 67000,
          publishDate: '2024-01-10',
          category: 'tutorial',
          featured: false
        }
      ];

      setVideos(mockVideos);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  const featuredVideos = videos.filter(video => video.featured);
  const regularVideos = filteredVideos.filter(video => !video.featured);

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className="videos-page">
      <div className="videos-header">
        <h1 className="videos-title">Financial Videos</h1>
        <p className="videos-subtitle">Educational content and market analysis</p>
      </div>

      <div className="videos-controls">
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

      <div className="videos-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading videos...</p>
          </div>
        ) : (
          <>
            {selectedCategory === 'all' && featuredVideos.length > 0 && (
              <div className="featured-section">
                <h2>Featured Videos</h2>
                <div className="featured-grid">
                  {featuredVideos.map((video) => (
                    <div key={video.id} className="video-card featured">
                      <div className="video-thumbnail">
                        <img src={video.thumbnail} alt={video.title} />
                        <div className="video-duration">{video.duration}</div>
                        <div className="play-button">▶</div>
                      </div>
                      <div className="video-info">
                        <h3 className="video-title">{video.title}</h3>
                        <p className="video-description">{video.description}</p>
                        <div className="video-meta">
                          <span className="views">{formatViews(video.views)} views</span>
                          <span className="date">{formatDate(video.publishDate)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="videos-section">
              <h2>{selectedCategory === 'all' ? 'All Videos' : categories.find(c => c.id === selectedCategory)?.label}</h2>
              <div className="videos-grid">
                {regularVideos.map((video) => (
                  <div key={video.id} className="video-card">
                    <div className="video-thumbnail">
                      <img src={video.thumbnail} alt={video.title} />
                      <div className="video-duration">{video.duration}</div>
                      <div className="play-button">▶</div>
                    </div>
                    <div className="video-info">
                      <h3 className="video-title">{video.title}</h3>
                      <p className="video-description">{video.description}</p>
                      <div className="video-meta">
                        <span className="views">{formatViews(video.views)} views</span>
                        <span className="date">{formatDate(video.publishDate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {filteredVideos.length === 0 && (
              <div className="no-results">
                <p>No videos found in this category.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VideosPage;
