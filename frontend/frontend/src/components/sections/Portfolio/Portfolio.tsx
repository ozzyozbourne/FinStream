import React from 'react';
import Button from '../../ui/Button';
import './Portfolio.css';

const Portfolio: React.FC = () => {
  const handleSignIn = () => {
    console.log('Portfolio sign in clicked');
    // TODO: Implement portfolio sign in
  };

  return (
    <div className="portfolio">
      <h3 className="section-title">Portfolio</h3>
      <div className="portfolio-content">
        <div className="portfolio-message">
          <p>Sign in to access your portfolio</p>
        </div>
        <Button 
          variant="outline" 
          size="small" 
          onClick={handleSignIn}
          className="portfolio-signin-button"
        >
          Sign in
        </Button>
      </div>
    </div>
  );
};

export default Portfolio;
