// ProfilePage.jsx
import { useState, useEffect } from 'react';
import { keycloakService } from '../../utils/keycloak';
import './ProfilePage.css';

const ProfilePage = () => {
  console.log('🚀 ProfilePage component is rendering!')
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone_number: '',
    address: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const realm = 'Finstream_External';

  useEffect(() => {
    console.log('🎯 useEffect is running!');
    const fetchProfile = async () => {
      console.log('📞 fetchProfile function called!');
      const isAuth =  keycloakService.isAuthenticated();
      console.log(isAuth)
      const token = keycloakService.getToken();
      if (!token) {
        console.log('❌ No token available, stopping...');
        setLoading(false);
        return;
      }
      try {
        console.log('🌐 Making API request...');
        const response = await fetch(
          `http://localhost:8080/realms/${realm}/protocol/openid-connect/userinfo`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response)
        console.log("touch")
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('User info:', data)
        console.log("touch")

        // Map Keycloak response
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone_number: data.phonenumber || '',
          address: data.address || '',
        });

        setLoading(false);
      } catch (err) {
       console.log('hi')
        console.error('Failed to fetch profile:', err);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleSave = async () => {
    console.log('Updated profile (local only):', profile);
    setIsEditing(false);
  };

  if (loading) return <p>Loading profile...</p>;


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

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button className="save-btn" onClick={handleSave}>Save</button>
              <button className="cancel-btn" onClick={handleEditToggle}>Cancel</button>
            </>
          ) : (
            <button className="edit-btn" onClick={handleEditToggle}>Edit Profile</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
