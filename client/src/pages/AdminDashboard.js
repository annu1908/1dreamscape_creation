import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './AdminDashboard.css';
import API from '../api';
import ProductFormModal from '../components/ProductFormModal';
import { getImageUrl } from '../utils/imageUtils';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'orders', or 'products'
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const navigate = useNavigate();

  // Access Control
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    let user = null;
    if (userData && userData !== 'undefined') {
      try { user = JSON.parse(userData); } catch (e) {}
    }
    if (!token || !user || user.role !== 'admin') {
      toast.error('Access denied! Admin only.');
      navigate('/');
    }
  }, [navigate]);

  // Fetch Data
  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  // Analytics computed from existing data
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
  const productSales = {};
  orders.forEach(order => {
    (order.items || []).forEach(item => {
      const key = item.title || item._id;
      productSales[key] = (productSales[key] || 0) + (item.quantity || 1);
    });
  });
  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const fetchOrders = async () => {
    try {
      const res = await API.get('/api/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await API.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  // --- Order Handlers ---
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/api/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated!');
      fetchOrders(); // refresh list
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'processing': return '#f59e0b';
      case 'shipped': return '#3b82f6';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#888';
    }
  };

  // --- Product Handlers ---
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await API.delete(`/api/products/${id}`);
        toast.success('Product deleted!');
        fetchProducts(); // refresh list
      } catch (err) {
        console.error('Failed to delete product:', err);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await API.put(`/api/products/${editingProduct._id}`, formData);
        toast.success('Product updated successfully!');
      } else {
        await API.post('/api/products', formData);
        toast.success('Product added successfully!');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Failed to save product:', err);
      toast.error('Failed to save product');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''} 
          onClick={() => setActiveTab('orders')}
        >
          Manage Orders
        </button>
        <button 
          className={activeTab === 'products' ? 'active' : ''} 
          onClick={() => setActiveTab('products')}
        >
          Manage Products
        </button>
      </div>

      {activeTab === 'analytics' && (
        <div className="admin-section">
          <h3>Store Analytics</h3>
          <div className="analytics-stats">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-value">{orders.length}</div>
              <div className="stat-label">Total Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🛍️</div>
              <div className="stat-value">{products.length}</div>
              <div className="stat-label">Products Listed</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-value">₹{avgOrderValue.toLocaleString('en-IN')}</div>
              <div className="stat-label">Avg Order Value</div>
            </div>
          </div>

          {topProducts.length > 0 && (
            <div className="top-products-section">
              <h4>Top Selling Products</h4>
              <div className="top-products-list">
                {topProducts.map(([name, qty], i) => (
                  <div key={name} className="top-product-row">
                    <span className="top-rank">#{i + 1}</span>
                    <span className="top-name">{name}</span>
                    <span className="top-qty">{qty} sold</span>
                    <div className="top-bar-wrap">
                      <div
                        className="top-bar"
                        style={{ width: `${Math.round((qty / topProducts[0][1]) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="order-status-summary">
            <h4>Orders by Status</h4>
            <div className="status-pills">
              {['processing', 'shipped', 'delivered', 'cancelled'].map(status => {
                const count = orders.filter(o => o.status === status).length;
                return (
                  <div key={status} className={`status-pill status-${status}`}>
                    <span className="status-count">{count}</span>
                    <span className="status-name">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="admin-section">
          <h3>Orders ({orders.length})</h3>
          <div className="orders-grid">
            {orders.map((order, index) => (
              <div key={order._id || index} className="order-card admin-order-card">
                <div className="order-header">
                  <span className="order-id">Order ID: {order._id.slice(-8).toUpperCase()}</span>
                  <div className="status-control">
                    <span 
                      className="status-indicator" 
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    ></span>
                    <select 
                      value={order.status || 'processing'} 
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="status-dropdown"
                    >
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                
                <div className="order-customer-info">
                  <p><strong>Customer:</strong> {order.customerName}</p>
                  <p><strong>Email:</strong> {order.customerEmail}</p>
                  <p><strong>Address:</strong> {order.deliveryAddress}</p>
                  <p className="order-total"><strong>Total:</strong> ₹{order.total}</p>
                </div>
                
                <div className="order-items-list">
                  <p><strong>Items:</strong></p>
                  <ul>
                    {order.items.map((item, i) => (
                      <li key={i}>{item.title} <span className="qty">x {item.quantity}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="empty-state">No orders found.</p>}
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="admin-section">
          <div className="section-header">
            <h3>Products Catalog ({products.length})</h3>
            <button className="btn-add" onClick={handleAddProduct}>+ Add New Product</button>
          </div>
          
          <div className="table-responsive">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id}>
                    <td>
                      <img src={getImageUrl(product.image)} alt={product.title} className="table-img" />
                    </td>
                    <td>{product.title}</td>
                    <td><span className="category-badge">{product.category}</span></td>
                    <td>₹{product.price}</td>
                    <td className="table-actions">
                      <button className="btn-edit" onClick={() => handleEditProduct(product)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDeleteProduct(product._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && <p className="empty-state">No products found. Add some!</p>}
          </div>
        </div>
      )}

      <ProductFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleModalSubmit}
        initialData={editingProduct}
      />
    </div>
  );
};

export default AdminDashboard;