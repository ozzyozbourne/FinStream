import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../ui/SearchBar';
import Button from '../../ui/Button';
import { useKeycloak } from '@react-keycloak/web';
import './Header.css';

const Header: React.FC = () => {

  const { keycloak } = useKeycloak();
  return (
    <header className="header">
      <div className="header-container">
        {/* Logo and Search */}
        <div className="header-left">
          <div className="logo">
            <span className="logo-text">FinStream</span>
            <span className="logo-subtitle">Finance</span>
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
          
          {!keycloak.authenticated && (
            <button
              type="button"
              className="text-blue-800"
              onClick={() => keycloak.login({ redirectUri: window.location.origin + '/profile' })}
            >
              Login
            </button>
          )}

          {!!keycloak.authenticated && (
            <button
              type="button"
              className="text-blue-800"
              onClick={() => keycloak.logout({ redirectUri: window.location.origin})}
            >
              Logout ({keycloak.tokenParsed?.preferred_username})
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;