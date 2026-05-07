import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Fetch recent orders
    API.get('/api/orders/my-orders')
      .then(res => setOrders(res.data || []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const initials = user.name
    ? user.name.split(' ').map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2)
    : '?';



  const getStatusColor = (status) => {
    switch (status) {
      case 'processing': return { bg: '#fef3c7', color: '#92400e' };
      case 'shipped': return { bg: '#dbeafe', color: '#1e40af' };
      case 'delivered': return { bg: '#dcfce7', color: '#166534' };
      case 'cancelled': return { bg: '#fee2e2', color: '#991b1b' };
      default: return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  return (
    <div className="profile-page">
      {/* Hero Banner */}
      <div className="profile-hero">
        <div className="profile-hero-content">
          <div className="profile-avatar-large">{initials}</div>
          <div className="profile-hero-info">
            <h1>{user.name}</h1>
            <p className="profile-hero-email">{user.email}</p>
            <div className="profile-hero-badges">
              <span className={`profile-badge ${user.role === 'admin' ? 'badge-admin' : 'badge-customer'}`}>
                {user.role === 'admin' ? '👑 Admin' : 'Customer'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-body">


        {/* Tabs */}
        <div className="profile-tabs">
          {['overview', 'orders', 'account'].map(tab => (
            <button
              key={tab}
              className={`profile-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' ? 'Overview' : tab === 'orders' ? 'My Orders' : 'Account'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="profile-tab-content">
            <div className="profile-quick-grid">
              <Link to="/orders" className="profile-quick-card">
                <div className="profile-quick-icon profile-quick-icon--orders">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </div>
                <div>
                  <h4>My Orders</h4>
                  <p>Track and manage orders</p>
                </div>
                <span className="profile-quick-arrow">›</span>
              </Link>
              <Link to="/wishlist" className="profile-quick-card">
                <div className="profile-quick-icon profile-quick-icon--wishlist">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </div>
                <div>
                  <h4>Wishlist</h4>
                  <p>Items saved for later</p>
                </div>
                <span className="profile-quick-arrow">›</span>
              </Link>
              <Link to="/cart" className="profile-quick-card">
                <div className="profile-quick-icon profile-quick-icon--cart">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                </div>
                <div>
                  <h4>My Cart</h4>
                  <p>Ready to checkout</p>
                </div>
                <span className="profile-quick-arrow">›</span>
              </Link>
              <Link to="/" className="profile-quick-card">
                <div className="profile-quick-icon profile-quick-icon--shop">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <div>
                  <h4>Browse Shop</h4>
                  <p>Discover new products</p>
                </div>
                <span className="profile-quick-arrow">›</span>
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="profile-quick-card profile-quick-card--admin">
                  <div className="profile-quick-icon profile-quick-icon--admin">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                  </div>
                  <div>
                    <h4>Admin Panel</h4>
                    <p>Manage store</p>
                  </div>
                  <span className="profile-quick-arrow">›</span>
                </Link>
              )}
            </div>

            {/* Recent Orders preview */}
            {!ordersLoading && orders.length > 0 && (
              <div className="profile-recent-orders">
                <div className="profile-section-header">
                  <h3>Recent Orders</h3>
                  <Link to="/orders" className="profile-view-all">View all →</Link>
                </div>
                {orders.slice(0, 3).map(order => {
                  const sc = getStatusColor(order.status);
                  return (
                    <div key={order._id} className="profile-order-row">
                      <div className="profile-order-id">
                        <span>#</span>{order._id?.slice(-8).toUpperCase()}
                      </div>
                      <div className="profile-order-items">
                        {(order.items || []).slice(0, 2).map(i => i.title).join(', ')}
                        {(order.items || []).length > 2 && ` +${order.items.length - 2} more`}
                      </div>
                      <div className="profile-order-total">₹{order.total?.toLocaleString('en-IN')}</div>
                      <span className="profile-order-status" style={{ background: sc.bg, color: sc.color }}>
                        {order.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="profile-tab-content">
            {ordersLoading ? (
              <div className="profile-loading">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="profile-empty">
                <span><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></span>
                <p>No orders yet. <Link to="/">Start shopping!</Link></p>
              </div>
            ) : (
              <div className="profile-orders-list">
                {orders.map(order => {
                  const sc = getStatusColor(order.status);
                  return (
                    <div key={order._id} className="profile-order-card">
                      <div className="profile-order-card-header">
                        <div>
                          <span className="profile-order-card-id">Order #{order._id?.slice(-8).toUpperCase()}</span>
                          <span className="profile-order-card-date">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <span className="profile-order-status" style={{ background: sc.bg, color: sc.color }}>
                          {order.status}
                        </span>
                      </div>
                      <div className="profile-order-card-items">
                        {(order.items || []).map((item, i) => (
                          <span key={i} className="profile-order-item-chip">
                            {item.title} × {item.quantity}
                          </span>
                        ))}
                      </div>
                      <div className="profile-order-card-footer">
                        <span className="profile-order-address"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'4px'}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> {order.deliveryAddress || 'N/A'}</span>
                        <span className="profile-order-card-total">₹{order.total?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'account' && (
          <div className="profile-tab-content">
            <div className="profile-account-card">
              <h3>Account Details</h3>
              <div className="profile-account-row">
                <span className="profile-account-label">Full Name</span>
                <span className="profile-account-value">{user.name}</span>
              </div>
              <div className="profile-account-row">
                <span className="profile-account-label">Email Address</span>
                <span className="profile-account-value">{user.email}</span>
              </div>
              <div className="profile-account-row">
                <span className="profile-account-label">Account Type</span>
                <span className="profile-account-value">{user.role === 'admin' ? 'Administrator' : 'Customer'}</span>
              </div>
            </div>

            <button className="profile-logout-btn" onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'6px',verticalAlign:'middle'}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
