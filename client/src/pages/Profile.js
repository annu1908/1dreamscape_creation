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

  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const delivered = orders.filter(o => o.status === 'delivered').length;

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
                {user.role === 'admin' ? '👑 Admin' : '🛍️ Customer'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-body">
        {/* Stats Row */}
        <div className="profile-stats-row">
          <div className="profile-stat">
            <span className="profile-stat-value">{orders.length}</span>
            <span className="profile-stat-label">Total Orders</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">{delivered}</span>
            <span className="profile-stat-label">Delivered</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">₹{totalSpent.toLocaleString('en-IN')}</span>
            <span className="profile-stat-label">Total Spent</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          {['overview', 'orders', 'account'].map(tab => (
            <button
              key={tab}
              className={`profile-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' ? '🏠 Overview' : tab === 'orders' ? '📦 My Orders' : '👤 Account'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="profile-tab-content">
            <div className="profile-quick-grid">
              <Link to="/orders" className="profile-quick-card">
                <div className="profile-quick-icon">📦</div>
                <div>
                  <h4>My Orders</h4>
                  <p>Track and manage orders</p>
                </div>
                <span className="profile-quick-arrow">›</span>
              </Link>
              <Link to="/wishlist" className="profile-quick-card">
                <div className="profile-quick-icon">❤️</div>
                <div>
                  <h4>Wishlist</h4>
                  <p>Items saved for later</p>
                </div>
                <span className="profile-quick-arrow">›</span>
              </Link>
              <Link to="/cart" className="profile-quick-card">
                <div className="profile-quick-icon">🛒</div>
                <div>
                  <h4>My Cart</h4>
                  <p>Ready to checkout</p>
                </div>
                <span className="profile-quick-arrow">›</span>
              </Link>
              <Link to="/" className="profile-quick-card">
                <div className="profile-quick-icon">🎨</div>
                <div>
                  <h4>Browse Shop</h4>
                  <p>Discover new products</p>
                </div>
                <span className="profile-quick-arrow">›</span>
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="profile-quick-card profile-quick-card--admin">
                  <div className="profile-quick-icon">⚙️</div>
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
                <span>📦</span>
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
                        <span className="profile-order-address">📍 {order.deliveryAddress || 'N/A'}</span>
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
              🚪 Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
