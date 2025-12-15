import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/Profile/ProfilePage';
import CustomDashboard from './pages/CustomDashboard';
import NewsPage from './pages/News';
import ResearchPage from './pages/Research';
import PersonalFinancePage from './pages/PersonalFinance';
import VideosPage from './pages/Videos';
import WatchPage from './pages/Watch';
import PortfolioPage from './pages/Portfolio';
import { HistoricalDataPage } from './pages/HistoricalData/HistoricalDataPage';
import LiveMarketsPage from "./pages/LiveMarkets";
import { SubscriptionProvider } from './context/SubscriptionContext';
import { PortfolioProvider } from './context/PortfolioContext';
import SubscriptionModal from './components/features/Subscription/SubscriptionModal';
import './App.css';

// Protected Route Component (inline)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (!keycloak.authenticated) {
    // Redirect to Keycloak login
    keycloak.login({ redirectUri: window.location.origin + window.location.pathname });
    return <div>Redirecting to login...</div>;
  }

  return <>{children}</>;
};

function App() {
  return (
    <SubscriptionProvider>
      <PortfolioProvider>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <CustomDashboard />
                </ProtectedRoute>
              } />
              <Route path="/historical-data" element={<HistoricalDataPage />} />
              <Route path="/live-markets" element={<LiveMarketsPage />} />
              <Route path="/news" element={
                <ProtectedRoute>
                  <NewsPage />
                </ProtectedRoute>
              } />
              <Route path="/research" element={
                <ProtectedRoute>
                  <ResearchPage />
                </ProtectedRoute>
              } />
              <Route path="/personal-finance" element={
                <ProtectedRoute>
                  <PersonalFinancePage />
                </ProtectedRoute>
              } />
              <Route path="/videos" element={
                <ProtectedRoute>
                  <VideosPage />
                </ProtectedRoute>
              } />
              <Route path="/watch" element={
                <ProtectedRoute>
                  <WatchPage />
                </ProtectedRoute>
              } />
              <Route path="/portfolio" element={
                <ProtectedRoute>
                  <PortfolioPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
            </Routes>
          </MainLayout>
          <SubscriptionModal />
        </Router>
      </PortfolioProvider>
    </SubscriptionProvider>
  );
}
export default App;