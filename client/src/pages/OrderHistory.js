import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import './OrderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await API.get('/api/orders/my-orders');
        setOrders(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load your orders.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing': return '#f59e0b';
      case 'shipped': return '#3b82f6';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#888';
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="order-history">
        <h2>My Orders</h2>
        <div className="order-loading">
          <div className="order-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history">
        <h2>My Orders</h2>
        <p className="order-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="order-history">
      <h2>My Orders</h2>

      {orders.length === 0 ? (
        <div className="order-empty">
          <span className="order-empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></span>
          <p>You haven't placed any orders yet.</p>
          <Link to="/" className="order-shop-btn">Start Shopping</Link>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <span className="order-id">Order #{order._id.slice(-8).toUpperCase()}</span>
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                </div>
                <span
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status || 'processing'}
                </span>
              </div>

              <div className="order-items">
                {order.items.map((item, i) => (
                  <div key={i} className="order-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className="order-item-name">{item.title}</span>
                        <span className="order-item-qty" style={{ marginLeft: '6px' }}>× {item.quantity}</span>
                      </div>
                      <span className="order-item-price">₹{item.price * item.quantity}</span>
                    </div>
                    {item.personalization && (
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                        Custom: {item.personalization}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="order-address">
                  <strong><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'4px'}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> Delivery:</strong> {order.deliveryAddress}
                </div>
                <div className="order-total">
                  <span>Total</span>
                  <strong>₹{order.total}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
