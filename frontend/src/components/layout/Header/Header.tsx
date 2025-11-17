import React from 'react';
import SearchBar from '../../ui/SearchBar';
import Button from '../../ui/Button';
import { useKeycloak } from '@react-keycloak/web';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo and Search */}
        <div className="header-left">
          <div 
            className="logo" 
            onClick={handleLogoClick}
            style={{ cursor: 'pointer' }}
          >
            <span className="logo-text">FinStream</span>
            <span className="logo-subtitle">Finance</span>
          </div>
          <div className="header-search">
            <SearchBar
              placeholder="Search for news, tickers or companies"
              onSearch={(e) => console.log(e)}
              className="header-search-bar"
            />
          </div>
        </div>

        {/* User Actions */}
        <div className="header-actions">
         

          {!keycloak.authenticated && (
            <Button
              variant="outline" size="small"
              onClick={() => keycloak.login({ redirectUri: window.location.origin + '/profile' })}
            >
              Sign in
            </Button>
          )}

          {!!keycloak.authenticated && (
            <Button
              type="button"
              className="text-blue-800"
              onClick={() => keycloak.logout({ redirectUri: window.location.origin })}
            >
              Logout
              </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;