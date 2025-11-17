// ProfilePage.tsx
import { useState, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import './ProfilePage.css';
import axios from 'axios';

const ProfilePage = () => {
  const { keycloak, initialized } = useKeycloak();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone_number: '',
    address: '',
    subscription: " " });
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
  const handleChange = (e) => {
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

  if (!initialized || loading) return <p>Loading profile...</p>;

  if (!keycloak.authenticated) {
    return (
      <div className="profile-page">
        <h1>Profile Management</h1>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1>Profile Management</h1>
      <div className="profile-card">
        <div className="profile-field">
          <label>Full Name:</label>
          {isEditing ? (
            <input type="text" name="name" value={profile.name} onChange={handleChange} />
          ) : (
            <span>{profile.name}</span>
          )}
        </div>

        <div className="profile-field">
          <label>Email:</label>
          {isEditing ? (
            <input type="email" name="email" value={profile.email} onChange={handleChange} />
          ) : (
            <span>{profile.email}</span>
          )}
        </div>

        <div className="profile-field">
          <label>Phone:</label>
          {isEditing ? (
            <input type="tel" name="phone_number" value={profile.phone_number} onChange={handleChange} />
          ) : (
            <span>{profile.phone_number}</span>
          )}
        </div>

        <div className="profile-field">
          <label>Address:</label>
          {isEditing ? (
            <input type="text" name="address" value={profile.address} onChange={handleChange} />
          ) : (
            <span>{profile.address}</span>
          )}
        </div>
           <div className="profile-field">
          <label>Subscription:</label>
            <span>{profile.subscription}</span>
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button className="save-btn" onClick={handleSave}>Save</button>
              <button className="cancel-btn" onClick={handleEdit}>Cancel</button>
            </>
          ) : (
            <button className="edit-btn" onClick={handleEdit}>Edit Profile</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;