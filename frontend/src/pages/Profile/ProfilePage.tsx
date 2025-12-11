// ProfilePage.tsx
import { useState, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import './ProfilePage.css';
import axios from 'axios';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'; // Importing from v2 format usually found in package.json dependencies

const ProfilePage = () => {
  const { keycloak, initialized } = useKeycloak();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone_number: '',
    address: '',
    subscription: " "
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const realm = 'Finstream_External';

  // Load profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!keycloak.authenticated || !keycloak.token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:8080/realms/${realm}/account`,
          {
            headers: { Authorization: `Bearer ${keycloak.token}` }
          }
        );

        const data = response.data;
        setProfile({
          name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.username || '',
          email: data.email || '',
          phone_number: data.attributes?.phone_number?.[0] || '',
          address: data.attributes?.address?.[0] || '',
          subscription: data.attributes?.subscription?.[0] || '',
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (initialized) {
      fetchProfile();
    }
  }, [keycloak, initialized]);

  // Update profile in Keycloak
  const editProfile = async () => {
    if (!keycloak.authenticated || !keycloak.token) {
      throw new Error('User not authenticated');
    }

    const requestBody = {
      username: keycloak.tokenParsed?.preferred_username || '',
      firstName: profile.name.split(' ')[0] || '',
      lastName: profile.name.split(' ').slice(1).join(' ') || '',
      email: profile.email,
      attributes: {
        phone_number: [profile.phone_number],
        address: [profile.address]
      }
    };

    const response = await axios.post(
      `http://localhost:8080/realms/${realm}/account`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle edit mode
  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Save changes
  const handleSave = async () => {
    try {
      await editProfile();
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (!initialized || loading) return <div className="profile-loading"><div className="spinner"></div></div>;

  if (!keycloak.authenticated) {
    return (
      <div className="profile-page">
        <div className="profile-container glass-panel">
          <h1 className="gradient-text">Profile Management</h1>
          <p className="login-prompt">Please log in to view your profile and manage your subscription.</p>
        </div>
      </div>
    );
  }

  // Generate initials for avatar
  const initials = profile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="profile-page">
      <div className="profile-header-section">
        <h1 className="gradient-text">Profile Management</h1>
        <p className="subtitle">Manage your personal information and subscription settings</p>
      </div>

      <div className="profile-container glass-panel">

        {/* Left Column: Avatar & Quick Info */}
        <div className="profile-sidebar">
          <div className="avatar-circle">
            {initials || <UserCircleIcon className="w-12 h-12" />}
          </div>
          <h2 className="profile-name">{profile.name || 'User'}</h2>
          <span className={`subscription-badge ${profile.subscription === 'Premium' ? 'premium' : 'free'}`}>
            {profile.subscription || 'Free Plan'}
          </span>
        </div>

        {/* Right Column: Detailed Form */}
        <div className="profile-details">
          <div className="section-header">
            <h3>Personal Information</h3>
            {!isEditing && (
              <button className="icon-btn edit-btn" onClick={handleEdit} title="Edit Profile">
                <PencilSquareIcon className="btn-icon" />
              </button>
            )}
          </div>

          <div className="fields-grid">
            <div className="profile-field">
              <label><UserCircleIcon className="field-icon" /> Full Name</label>
              {isEditing ? (
                <input type="text" name="name" value={profile.name} onChange={handleChange} className="glass-input" placeholder="John Doe" />
              ) : (
                <span className="field-value">{profile.name}</span>
              )}
            </div>

            <div className="profile-field">
              <label><EnvelopeIcon className="field-icon" /> Email Address</label>
              {isEditing ? (
                <input type="email" name="email" value={profile.email} onChange={handleChange} className="glass-input" placeholder="john@example.com" disabled /> // Usually email is not editable directly
              ) : (
                <span className="field-value">{profile.email}</span>
              )}
            </div>

            <div className="profile-field">
              <label><PhoneIcon className="field-icon" /> Phone Number</label>
              {isEditing ? (
                <input type="tel" name="phone_number" value={profile.phone_number} onChange={handleChange} className="glass-input" placeholder="+1 (555) 000-0000" />
              ) : (
                <span className="field-value">{profile.phone_number || 'Not set'}</span>
              )}
            </div>

            <div className="profile-field full-width">
              <label><MapPinIcon className="field-icon" /> Address</label>
              {isEditing ? (
                <input type="text" name="address" value={profile.address} onChange={handleChange} className="glass-input" placeholder="123 FinStream Blvd" />
              ) : (
                <span className="field-value">{profile.address || 'Not set'}</span>
              )}
            </div>

            <div className="profile-field full-width">
              <label><CreditCardIcon className="field-icon" /> Current Plan</label>
              <div className="plan-display">
                <span className="plan-name">{profile.subscription || 'Free'}</span>
                {profile.subscription !== 'Premium' && (
                  <button className="upgrade-link">Upgrade to Premium</button>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="profile-actions-footer">
              <button className="action-btn cancel-btn" onClick={handleEdit}>
                <XMarkIcon className="btn-icon-sm" /> Cancel
              </button>
              <button className="action-btn save-btn" onClick={handleSave}>
                <CheckIcon className="btn-icon-sm" /> Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
