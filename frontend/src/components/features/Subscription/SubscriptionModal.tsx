import React, { useState, useEffect, useCallback } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';
import { useSubscription } from '../../../context/SubscriptionContext';
import { generateReceipt } from '../../../services/pdfService';
import Button from '../../ui/Button';
import './SubscriptionModal.css';

type PlanType = {
    id: string;
    name: string;
    price: string;
    period: string;
    features: string[];
    popular?: boolean;
};

const SubscriptionModal: React.FC = () => {
    const { isModalOpen, closeModal } = useSubscription();
    const { keycloak } = useKeycloak();
    const realm = 'Finstream_External';

    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
    const [currentSubscription, setCurrentSubscription] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

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

    // LOAD SUBSCRIPTION ON OPEN
    useEffect(() => {
        if (isModalOpen) {
            fetchCurrentSubscription();
        }
    }, [isModalOpen, fetchCurrentSubscription]);

    const handleSelectPlan = (plan: PlanType) => {
        setSelectedPlan(plan);
        setShowPaymentForm(true);
    };

    const handleBackToPlans = () => {
        setShowPaymentForm(false);
    };

    // GENERIC UPDATE PROFILE ATTRIBUTES
    const updateProfileAttributes = async (newAttributes: Record<string, any>) => {
        if (!keycloak.authenticated || !keycloak.token) {
            throw new Error('User not authenticated');
        }
        try {
            const token = keycloak.token;
            // 1. Fetch latest profile to ensure we don't overwrite existing attributes with stale data
            const profileResponse = await axios.get(
                `http://localhost:8080/realms/${realm}/account`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const profile = profileResponse.data;
            const existingAttributes = profile.attributes || {};

            // 2. Merge attributes
            const updatedProfile = {
                ...profile,
                attributes: {
                    ...existingAttributes,
                    ...newAttributes
                }
            };

            // 3. Save back to Keycloak
            await axios.post(
                `http://localhost:8080/realms/${realm}/account`,
                updatedProfile,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            return updatedProfile;
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            throw error;
        }
    };

    // PAYMENT FORM SUBMIT
    // PAYMENT FORM SUBMIT
    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlan || !keycloak.token) return;

        try {
            // 1. Fetch current history first (to append correctly)
            const profileResponse = await axios.get(
                `http://localhost:8080/realms/${realm}/account`,
                { headers: { Authorization: `Bearer ${keycloak.token}` } }
            );

            const attributes = profileResponse.data.attributes || {};

            // 1. Get history from LocalStorage (Session persistence as requested)
            const userEmail = keycloak.tokenParsed?.email;
            const storageKey = `payment_history_${userEmail}`;
            let currentHistory = [];

            try {
                const stored = localStorage.getItem(storageKey);
                if (stored) currentHistory = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse local history", e);
            }

            // 2. Create new transaction
            const newTransaction = {
                id: `TXN-${Date.now()}`,
                date: new Date().toLocaleDateString(),
                planName: selectedPlan.name,
                amount: selectedPlan.price,
                status: 'Success'
            };

            const updatedHistory = [...currentHistory, newTransaction];
            localStorage.setItem(storageKey, JSON.stringify(updatedHistory));

            // 3. Update Keycloak (Subscription Status Only)
            await updateProfileAttributes({
                subscription: [selectedPlan.id]
            });

            // 4. Generate PDF
            generateReceipt({
                id: newTransaction.id,
                date: newTransaction.date,
                planName: newTransaction.planName,
                amount: newTransaction.amount,
                userEmail: userEmail || '',
                userName: `${profileResponse.data.firstName || ''} ${profileResponse.data.lastName || ''}`.trim()
            });

            // 5. Success UI
            setCurrentSubscription(selectedPlan.id);
            setShowSuccess(true);
            // Don't close or reload yet

        } catch (err) {
            console.error('Failed to process payment:', err);
            alert('Failed to process payment. Please try again.');
        }
    };

    const handleSuccessDismiss = () => {
        setShowSuccess(false);
        setShowPaymentForm(false);
        setSelectedPlan(null);
        closeModal();
        window.location.reload();
    };

    if (!isModalOpen) return null;

    return (
        <>
            {/* SUCCESS MODAL */}
            {showSuccess && (
                <div className="modal-overlay" onClick={() => { }}>
                    <div className="payment-modal success-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="success-content">
                            <div className="success-icon-large">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#00d4aa" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                            <h2>Payment Successful!</h2>
                            <p>Your plan has been upgraded to <strong>{selectedPlan?.name}</strong>.</p>
                            <p className="success-subtext">Your receipt is downloading securely.</p>

                            <Button
                                variant="primary"
                                onClick={handleSuccessDismiss}
                                className="success-ok-btn"
                            >
                                OK, Thanks
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* PLANS MODAL */}
            {!showPaymentForm && !showSuccess && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="payment-modal-header">
                            <h2>Choose Your Plan</h2>
                            <button
                                className="modal-close-button"
                                onClick={closeModal}
                                aria-label="Close"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
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
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <Button
                                            variant={plan.popular ? 'primary' : 'secondary'}
                                            onClick={() => handleSelectPlan(plan)}
                                            className="select-plan-button"
                                            disabled={currentSubscription === plan.id}
                                        >
                                            {currentSubscription === plan.id ? 'Current Plan' : `Select ${plan.name}`}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Form Modal */}
            {showPaymentForm && selectedPlan && !showSuccess && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="payment-form-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="payment-modal-header">
                            <button
                                className="back-button"
                                onClick={handleBackToPlans}
                                aria-label="Back to plans"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="19" y1="12" x2="5" y2="12" />
                                    <polyline points="12 19 5 12 12 5" />
                                </svg>
                            </button>
                            <h2>Complete Your Purchase</h2>
                            <button
                                className="modal-close-button"
                                onClick={closeModal}
                                aria-label="Close"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
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
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="12" y1="16" x2="12" y2="12" />
                                                <line x1="12" y1="8" x2="12.01" y2="8" />
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
                                                            <polyline points="20 6 9 17 4 12" />
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

export default SubscriptionModal;
