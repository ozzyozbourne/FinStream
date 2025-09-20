import React from 'react';
import Header from '../Header';
import SecondaryNav from '../SecondaryNav';
import './MainLayout.css';

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
