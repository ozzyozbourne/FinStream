// ProfilePage.jsx
import { useState } from 'react';
import './ProfilePage.css';

const ProfilePage = () => {

  const [profile, setProfile] = useState({
    fullName: 'Zoha Fatima Ahmed',
    email: 'zoha@example.com',
    phone: '+1 123 456 7890',
    address: '123 Main Street, City, Country',
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    // Here you can call an API to save profile changes
    console.log('Saved profile:', profile);
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      <h1>Profile Management</h1>
      <div className="profile-card">
        <div className="profile-field">
          <label>Full Name:</label>
          {isEditing ? (
            <input
              type="text"
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
            />
          ) : (
            <span>{profile.fullName}</span>
          )}
        </div>

        <div className="profile-field">
          <label>Email:</label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
            />
          ) : (
            <span>{profile.email}</span>
          )}
        </div>

        <div className="profile-field">
          <label>Phone:</label>
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
            />
          ) : (
            <span>{profile.phone}</span>
          )}
        </div>

        <div className="profile-field">
          <label>Address:</label>
          {isEditing ? (
            <input
              type="text"
              name="address"
              value={profile.address}
              onChange={handleChange}
            />
          ) : (
            <span>{profile.address}</span>
          )}
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button className="save-btn" onClick={handleSave}>
                Save
              </button>
              <button className="cancel-btn" onClick={handleEditToggle}>
                Cancel
              </button>
            </>
          ) : (
            <button className="edit-btn" onClick={handleEditToggle}>
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
