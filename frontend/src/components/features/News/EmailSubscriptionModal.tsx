
import React, { useState } from 'react';
import axios from 'axios';
import { usePortfolio } from '../../../context/PortfolioContext';
import { newsService } from '../../../services/newsService';
import Button from '../../ui/Button';
import './EmailSubscriptionModal.css';

interface EmailSubscriptionModalProps {
    onClose: () => void;
}

const EmailSubscriptionModal: React.FC<EmailSubscriptionModalProps> = ({ onClose }) => {
    const { holdings } = usePortfolio();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const symbols = holdings.map(h => h.symbol);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (symbols.length === 0) {
            setStatus('error');
            setMessage("Your portfolio is empty. Add some stocks first!");
            return;
        }

        try {
            setStatus('loading');
            await newsService.subscribe(email, symbols);
            setStatus('success');
            setMessage("Successfully subscribed! Check your inbox tomorrow morning.");
            setTimeout(onClose, 2000);
        } catch (error) {
            setStatus('error');
            setMessage("Failed to subscribe. Please try again.");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content subscription-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Get Daily News Alerts</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <p className="modal-description">
                        Receive a daily morning digest of breaking news for your {symbols.length} portfolio holdings:
                        <br />
                        <span className="holdings-preview">{symbols.slice(0, 5).join(', ')}{symbols.length > 5 ? '...' : ''}</span>
                    </p>

                    <form onSubmit={handleSubmit} className="subscription-form">
                        <div className="form-group">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="email-input"
                            />
                        </div>

                        {status === 'error' && <p className="error-message">{message}</p>}
                        {status === 'success' && <p className="success-message">{message}</p>}

                        <Button
                            variant="primary"
                            type="submit"
                            disabled={status === 'loading' || status === 'success'}
                            className="subscribe-btn"
                        >
                            {status === 'loading' ? 'Subscribing...' : 'Subscribe Now'}
                        </Button>
                    </form>

                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    setMessage('Sending test email... please wait.');
                                    setStatus('loading');
                                    await axios.post('http://localhost:3001/api/trigger-email', {
                                        email: email || 'test@example.com',
                                        symbols: symbols.length > 0 ? symbols : ['AAPL', 'TSLA']
                                    });
                                    setMessage('Test email sent! Check your inbox.');
                                    setStatus('success');
                                } catch (e) {
                                    console.error(e);
                                    setMessage('Failed to trigger test email.');
                                    setStatus('error');
                                }
                            }}
                            style={{
                                background: 'transparent',
                                border: '1px solid #444',
                                color: '#888',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                            }}
                        >
                            Send Test Email (Dev)
                        </button>
                    </div>

                    <p className="disclaimer">
                        We'll only send one email per day at 8:00 AM. Unsubscribe anytime.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmailSubscriptionModal;
