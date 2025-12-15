import { Link, NavLink } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';
import Button from '../../ui/Button';
import { useKeycloak } from '@react-keycloak/web';
import { useSubscription } from '../../../context/SubscriptionContext';
import './SecondaryNav.css';
import axios from 'axios';

type PlanType = {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
};

const SecondaryNav: React.FC = () => {
  const { keycloak } = useKeycloak();
  const realm = 'Finstream_External';
  const { openModal } = useSubscription();
  const [currentSubscription, setCurrentSubscription] = useState<string | null>(null);

  // PLANS DATA
  const plans: PlanType[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$9',
      period: '/month',
      features: []
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$19',
      period: '/month',
      popular: true,
      features: []
    },
    {
      id: 'advance',
      name: 'Advance',
      price: '$39',
      period: '/month',
      features: []
    }
  ];

  // NAV ITEMS
  const NavItems = [
    { id: 'my-profile', label: 'Profile', href: '/profile' },
    { id: 'my-portfolio', label: 'Portfolio', href: '/portfolio' },
    { id: 'dashboard', label: 'Custom Dashboard', href: '/dashboard' },
    { id: 'news', label: 'News', href: '/news' },

    { id: 'research', label: 'Live Market Data', href: '/live-markets' }, // Corrected href from /research if needed, keeping context
    { id: 'historical-data', label: 'Historical Data', href: '/historical-data' },
  ];

  // FETCH CURRENT SUBSCRIPTION
  const fetchCurrentSubscription = useCallback(async () => {
    if (!keycloak.authenticated || !keycloak.token) {
      setCurrentSubscription(null);
      return;
    }
    try {
      const profileResponse = await axios.get(
        `http://localhost:8080/realms/${realm}/account`,
        {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        }
      );
      const subscription = profileResponse.data?.attributes?.subscription?.[0] || null;
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      setCurrentSubscription(null);
    }
  }, [keycloak.authenticated, keycloak.token, realm]);

  // LOAD SUBSCRIPTION ON AUTH CHANGE
  useEffect(() => {
    fetchCurrentSubscription();
  }, [fetchCurrentSubscription]);

  const handleUpgrade = () => {
    openModal();
  };

  return (
    <>
      <nav className="secondary-nav">
        <div className="secondary-nav-container">
          <div className="secondary-nav-left">
            <ul className="secondary-nav-list">
              {NavItems.filter(item => {
                // Show Profile only if user is authenticated
                if (item.id === 'my-profile') {
                  return keycloak.authenticated;
                }
                return true;
              }).map((item) => (
                <li key={item.id} className="secondary-nav-item">
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      isActive ? 'secondary-nav-link active' : 'secondary-nav-link'
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="secondary-nav-right">
            {keycloak.authenticated && (
              <>
                {currentSubscription && currentSubscription !== 'free' ? (
                  <Link to="/profile" style={{ textDecoration: 'none' }}>
                    <span
                      className="current-plan-text"
                      style={{ color: '#22c55e', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {plans.find((p) => p.id === currentSubscription)?.name || currentSubscription} Plan
                    </span>
                  </Link>
                ) : (
                  <Button variant="primary" size="small" className="upgrade-button" onClick={handleUpgrade}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <circle cx="12" cy="16" r="1" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg> Upgrade to Premium
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default SecondaryNav;