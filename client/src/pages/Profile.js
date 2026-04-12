import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    try {
      setUser(JSON.parse(userData));
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  if (!user) return null;

  const initials = user.name
    ? user.name.split(' ').map(n => n.charAt(0).toUpperCase()).join('')
    : '?';

  const memberSince = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              {initials}
            </div>
            <div className="profile-avatar-ring"></div>
          </div>
          <div className="profile-header-info">
            <h1>{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            <div className="profile-badges">
              <span className="badge badge-role">
                {user.role === 'admin' ? '👑 Admin' : '🛍️ Customer'}
              </span>
              <span className="badge badge-member">
                Member since {memberSince}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="profile-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-actions-grid">
            <Link to="/orders" className="action-card">
              <div className="action-icon">📦</div>
              <h3>My Orders</h3>
              <p>Track and manage your orders</p>
            </Link>
            <Link to="/wishlist" className="action-card">
              <div className="action-icon">❤️</div>
              <h3>Wishlist</h3>
              <p>Items you've saved for later</p>
            </Link>
            <Link to="/cart" className="action-card">
              <div className="action-icon">🛒</div>
              <h3>Cart</h3>
              <p>View items in your cart</p>
            </Link>
            <Link to="/" className="action-card">
              <div className="action-icon">🏠</div>
              <h3>Shop</h3>
              <p>Browse our entire collection</p>
            </Link>
          </div>
        </div>

        {/* Account Details */}
        <div className="profile-section">
          <h2 className="section-title">Account Details</h2>
          <div className="account-details-card">
            <div className="detail-row">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{user.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{user.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Account Type</span>
              <span className="detail-value">{user.role === 'admin' ? 'Administrator' : 'Customer'}</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="profile-section">
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;
