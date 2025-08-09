import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css'; // create CSS file if needed

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  // 🛡️ Access Control - Only allow admin
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.email !== 'admin@gmail.com') {
      alert('Access denied! Only admin can access this page.');
      navigate('/');
    }
  }, [navigate]);

  // 📦 Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('https://onedreamscape-creation.onrender.com/api/orders'); // adjust URL if needed
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <p>Total Orders: {orders.length}</p>

      {orders.map((order, index) => (
        <div key={order._id || index} className="order-card">
          <p><strong>Name:</strong> {order.customerName}</p>
          <p><strong>Email:</strong> {order.customerEmail}</p>
          <p><strong>Address:</strong> {order.deliveryAddress}</p>
          <p><strong>Total:</strong> ₹{order.total}</p>
          <p><strong>Items:</strong></p>
          <ul>
            {order.items.map((item, i) => (
              <li key={i}>{item.title} x {item.quantity}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;