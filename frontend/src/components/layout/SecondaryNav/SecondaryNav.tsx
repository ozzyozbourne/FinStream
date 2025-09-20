import React from 'react';
import { mockNavItems } from '../../../utils/mockData';
import Button from '../../ui/Button';
import './SecondaryNav.css';

const SecondaryNav: React.FC = () => {
  const handleUpgrade = () => {
    console.log('Upgrade to Premium clicked');
    // TODO: Implement upgrade functionality
  };

  return (
    <nav className="secondary-nav">
      <div className="secondary-nav-container">
        <div className="secondary-nav-left">
          <ul className="secondary-nav-list">
            {mockNavItems.map((item) => (
              <li key={item.id} className="secondary-nav-item">
                <a href={item.href} className="secondary-nav-link">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="secondary-nav-right">
          <Button 
            variant="primary" 
            size="small" 
            onClick={handleUpgrade}
            className="upgrade-button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <circle cx="12" cy="16" r="1"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Upgrade to Premium
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default SecondaryNav;
