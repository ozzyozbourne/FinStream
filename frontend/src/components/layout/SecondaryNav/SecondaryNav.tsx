import React, { useState, useEffect, useCallback } from 'react';
import Button from '../../ui/Button';
import { useKeycloak } from '@react-keycloak/web';
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<string | null>(null);
  
  // PLANS DATA
  const plans: PlanType[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$9',
      period: '/month',
      features: [
        'Up to 10 dashboards',
        'Basic tracking',
        'Email support',
        'Mobile app access'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$19',
      period: '/month',
      popular: true,
      features: [
        'Unlimited dashboards',
        'Advanced tracking',
        'Limited Flat files downloads',
        'Mobile app access',
        'Custom reports'
      ]
    },
    {
      id: 'advance',
      name: 'Advance',
      price: '$39',
      period: '/month',
      features: [
        'Everything in Premium',
        'Multi-user access',
        'API access',
        'Advanced analytics',
        'Custom integrations',
        'Dedicated account manager',
        'Unlimited Flat files downloads'
      ]
    }
  ];
  
  // NAV ITEMS
  const NavItems = [
    { id: 'my-profile', label: 'Profile', href: '/profile' },
    { id: 'my-portfolio', label: 'Portfolio', href: '/portfolio' },
    { id: 'dashboard', label: 'Custom Dashboard', href: '/dashboard' },
    { id: 'markets', label: 'Markets', href: '/markets' },
    { id: 'research', label: 'Live Market Data', href: '/research' },
    { id: 'personal-finance', label: 'Personal Finance', href: '/personal-finance' },
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
    setShowPaymentModal(true);
    setShowPaymentForm(false);
  };
  
  const handleSelectPlan = (plan: PlanType) => {
    setSelectedPlan(plan);
    setShowPaymentForm(true);
    setShowPaymentModal(false);
  };

  const handleBackToPlans = () => {
    setShowPaymentForm(false);
    setShowPaymentModal(true);
  };

  // UPDATE SUBSCRIPTION IN KEYCLOAK
  const updatePlan = async (subscription: string, planId: string) => {
    if (!keycloak.authenticated || !keycloak.token) {
      throw new Error('User not authenticated');
    }
    try {
      const token = keycloak.token;
      const profileResponse = await axios.get(
        `http://localhost:8080/realms/${realm}/account`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const profile = profileResponse.data;
      const updatedProfile = {
        username: profile.username || keycloak.tokenParsed?.preferred_username || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        attributes: {
          phone_number: profile.attributes?.phone_number?.[0] ? [profile.attributes.phone_number[0]] : [''],
          address: profile.attributes?.address?.[0] ? [profile.attributes.address[0]] : [''],
          [subscription]: [planId],
        },
      };
      const updateResponse = await axios.post(
        `http://localhost:8080/realms/${realm}/account`,
        updatedProfile,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Subscription updated successfully:', updateResponse.data);
      return updateResponse.data;
    } catch (error: any) {
      console.error('Failed to update subscription:', error);
      throw new Error(error.message || 'Unknown error');
    }
  };
  
  // PAYMENT FORM SUBMIT
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    try {
      await updatePlan('subscription', selectedPlan.id);
      setCurrentSubscription(selectedPlan.id);
      alert(`Subscription updated to ${selectedPlan.name} (${selectedPlan.id})`);
      setShowPaymentForm(false);
      setSelectedPlan(null);
    } catch (err) {
      console.error('Failed to update subscription:', err);
      alert('Failed to update subscription. Please try again.');
    }
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
                  <a href={item.href} className="secondary-nav-link">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="secondary-nav-right">
            {keycloak.authenticated && (
              <>
                {currentSubscription && currentSubscription !== 'free' ? (
                  <span
                    className="current-plan-text"
                    style={{ color: '#22c55e', fontWeight: 600 }}
                  >
                    {plans.find((p) => p.id === currentSubscription)?.name || currentSubscription} Plan
                  </span>
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

      {/* PLANS MODAL */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="payment-modal-header">
              <h2>Choose Your Plan</h2>
              <button 
                className="modal-close-button"
                onClick={() => setShowPaymentModal(false)}
                aria-label="Close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="payment-modal-content">
              <div className="pricing-plans">
                {plans.map((plan) => (
                  <div key={plan.id} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                    {plan.popular && <div className="popular-badge">Most Popular</div>}

                    <h3 className="plan-name">{plan.name}</h3>
                    <div className="plan-price">
                      <span className="price">{plan.price}</span>
                      <span className="period">{plan.period}</span>
                    </div>

                    <ul className="plan-features">
                      {plan.features.map((feature, index) => (
                        <li key={index}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={plan.popular ? 'primary' : 'secondary'}
                      onClick={() => handleSelectPlan(plan)}
                      className="select-plan-button"
                    >
                      Select {plan.name}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && selectedPlan && (
        <div className="modal-overlay" onClick={() => setShowPaymentForm(false)}>
          <div className="payment-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="payment-modal-header">
              <button 
                className="back-button"
                onClick={handleBackToPlans}
                aria-label="Back to plans"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12"/>
                  <polyline points="12 19 5 12 12 5"/>
                </svg>
              </button>
              <h2>Complete Your Purchase</h2>
              <button 
                className="modal-close-button"
                onClick={() => setShowPaymentForm(false)}
                aria-label="Close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="payment-form-content">
              <div className="payment-form-layout">
                <div className="payment-form-left">
                  <form onSubmit={handlePaymentSubmit}>
                    <div className="form-section">
                      <h3 className="form-section-title">Payment Information</h3>
                      
                      <div className="form-group">
                        <label htmlFor="cardNumber">Card Number</label>
                        <input
                          type="text"
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          required
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="expiry">Expiry Date</label>
                          <input
                            type="text"
                            id="expiry"
                            placeholder="MM/YY"
                            maxLength={5}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="cvc">CVC</label>
                          <input
                            type="text"
                            id="cvc"
                            placeholder="123"
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h3 className="form-section-title">Billing Information</h3>
                      
                      <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                          type="text"
                          id="name"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                          type="email"
                          id="email"
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <input
                          type="text"
                          id="address"
                          placeholder="123 Main Street"
                          required
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="city">City</label>
                          <input
                            type="text"
                            id="city"
                            placeholder="New York"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="zip">ZIP Code</label>
                          <input
                            type="text"
                            id="zip"
                            placeholder="10001"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="demo-notice">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                      </svg>
                      <span>This is a demo payment form. No actual charges will be made.</span>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="submit-payment-button"
                    >
                      Complete Purchase
                    </Button>
                  </form>
                </div>

                <div className="payment-form-right">
                  <div className="order-summary">
                    <h3>Order Summary</h3>
                    
                    <div className="summary-plan">
                      <div className="summary-plan-header">
                        <span className="summary-plan-name">{selectedPlan.name} Plan</span>
                        {selectedPlan.popular && (
                          <span className="summary-badge">Popular</span>
                        )}
                      </div>
                      <div className="summary-plan-price">
                        {selectedPlan.price}<span className="summary-period">{selectedPlan.period}</span>
                      </div>
                    </div>

                    <div className="summary-features">
                      <h4>Included Features:</h4>
                      <ul>
                        {selectedPlan.features.map((feature, index) => (
                          <li key={index}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="summary-divider"></div>

                    <div className="summary-total">
                      <span>Total due today</span>
                      <span className="summary-total-price">{selectedPlan.price}</span>
                    </div>

                    <div className="summary-note">
                      Your subscription will automatically renew monthly. Cancel anytime.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SecondaryNav;