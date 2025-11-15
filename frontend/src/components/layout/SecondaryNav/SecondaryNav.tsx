import React from 'react';
import { mockNavItems } from '../../../utils/mockData';
import Button from '../../ui/Button';
import './SecondaryNav.css';
import { useState } from 'react';

const SecondaryNav: React.FC = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);

  const handleUpgrade = () => {
    setShowPaymentModal(true);
    setShowPaymentForm(false);
  };

  const plans = [
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
      features: [
        'Unlimited dashboards',
        'Advanced tracking',
        'Limited Flat files downloads',
        'Mobile app access',
        'Custom reports'
      ],
      popular: true
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

  const handleSelectPlan = (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
    setShowPaymentForm(true);
    setShowPaymentModal(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Payment submitted for plan:', selectedPlan?.name);
    alert('Demo: Payment processed successfully! (This is a fake payment form for demonstration purposes)');
    setShowPaymentForm(false);
    setSelectedPlan(null);
  };

  const handleBackToPlans = () => {
    setShowPaymentForm(false);
    setShowPaymentModal(true);
  };

  return (
    <>
      <nav className="secondary-nav">
        <div className="secondary-nav-container">
          <div className="secondary-nav-left">
            <ul className="secondary-nav-list">
              {mockNavItems.map((item) => (
                <li key={item.id} className="secondary-nav-item">
                  <a href={item.href} className="secondary-nav-link">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="secondary-nav-right">
            <Button 
              variant="primary" 
              size="small" 
              onClick={handleUpgrade}
              className="upgrade-button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Upgrade to Premium
            </Button>
          </div>
        </div>
      </nav>

      {/* Plans Modal */}
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
                  <div 
                    key={plan.id} 
                    className={`pricing-card ${plan.popular ? 'popular' : ''}`}
                  >
                    {plan.popular && (
                      <div className="popular-badge">Most Popular</div>
                    )}
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