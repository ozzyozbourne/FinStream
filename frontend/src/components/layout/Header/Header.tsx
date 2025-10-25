import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../ui/SearchBar';
import Button from '../../ui/Button';
import './Header.css';
import { keycloakService } from '../../../utils/keycloak';

import {useState, useEffect} from 'react';


const Header: React.FC = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  
  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // TODO: Implement search functionality
  };

  const handleLogoClick = () => {
    navigate('/');
  };
  useEffect(() => {
    const initializeAuth = async () => {
      const authenticated = await keycloakService.init();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        setUserName(keycloakService.getUserName());
      }
    };
    initializeAuth();
  }, []);

  const handleSignIn = () => {
    keycloakService.login(); // no await, Keycloak will handle redirect
  };

  const handleSignOut = () => {
    console.log("🚪 Logging out user...");
    setIsAuthenticated(false);
    setUserName('');
    keycloakService.logout(); // This will redirect to Keycloak logout
  };
  return (
    <header className="header">
      <div className="header-container">
        {/* Logo and Search */}
        <div className="header-left">
          <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <span className="logo-text">finStream</span>
            <span className="logo-subtitle">finance</span>
          </div>
          <div className="header-search">
            <SearchBar
              placeholder="Search for news, tickers or companies"
              onSearch={handleSearch}
              className="header-search-bar"
            />
          </div>
        </div>



        {/* User Actions */}
        <div className="header-actions">
          <button className="action-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <button className="action-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span className="mail-text">Mail</span>
          </button>
          {/* Conditional rendering based on authentication status */}
          {isAuthenticated ? (
            <div className="user-info">
              <span className="user-name">Welcome, {userName}</span>
              <Button variant="outline" size="small" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="small" onClick={handleSignIn}>
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
