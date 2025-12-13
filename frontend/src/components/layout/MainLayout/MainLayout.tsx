import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header';

import './MainLayout.css';
import SecondaryNav from '../SecondaryNav/SecondaryNav';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="main-layout">
      <Header />
      <SecondaryNav />
      <main className="main-content">
        <div className={`content-container ${!isHomePage ? 'full-width' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
