import React from 'react';
import Header from '../Header';

import './MainLayout.css';
import SecondaryNav from '../SecondaryNav/SecondaryNav';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="main-layout">
      <Header />
      <SecondaryNav />
      <main className="main-content">
        <div className="content-container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
