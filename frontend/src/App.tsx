import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/Profile/ProfilePage';
import CustomDashboard from './pages/CustomDashboard';
import NewsPage from './pages/News';
import MarketsPage from './pages/Markets';
import ResearchPage from './pages/Research';
import PersonalFinancePage from './pages/PersonalFinance';
import VideosPage from './pages/Videos';
import WatchPage from './pages/Watch';
import PortfolioPage from './pages/Portfolio';
import './App.css';

function App() {
  return (
    <Router>
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/dashboard" element={<CustomDashboard />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/markets" element={<MarketsPage />} />
        <Route path="/research" element={<ResearchPage />} />
        <Route path="/personal-finance" element={<PersonalFinancePage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/watch" element={<WatchPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
      </Routes>
    </MainLayout>
  </Router>
  );
}

export default App;