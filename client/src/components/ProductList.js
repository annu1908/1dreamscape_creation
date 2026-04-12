import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import './ProductList.css';
import API from '../api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  // Extract category from URL
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get('category') || 'all';

  // Load products once
  useEffect(() => {
    API.get('/api/products/')
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load products');
        setLoading(false);
      });
  }, []);

  // Filter products whenever products, URL category, or search query changes
  useEffect(() => {
    if (products.length === 0) return;

    let result = products;

    // Category filter
    if (categoryParam !== 'all') {
      result = result.filter((p) =>
        p.category?.toLowerCase().trim() === categoryParam.toLowerCase().trim()
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [products, categoryParam, searchQuery]);

  const handleFilter = (cat) => {
    if (cat === 'all') {
      navigate('/');
    } else {
      navigate(`/?category=${cat}`);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div><p>Loading Products...</p></div>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div id="product-section" className='product-list'>
      <h2>Our Products</h2>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search products by name, description, or category..."
          value={searchQuery}
          onChange={handleSearch}
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => setSearchQuery('')}>
            ✕
          </button>
        )}
      </div>

      <div className="filter-buttons">
        <button onClick={() => handleFilter('all')} className={categoryParam === 'all' ? 'active' : ''}>All</button>
        <button onClick={() => handleFilter('resin')} className={categoryParam === 'resin' ? 'active' : ''}>Resin</button>
        <button onClick={() => handleFilter('embroidery')} className={categoryParam === 'embroidery' ? 'active' : ''}>Embroidery</button>
        <button onClick={() => handleFilter('sketch')} className={categoryParam === 'sketch' ? 'active' : ''}>Sketch</button>
        <button onClick={() => handleFilter('crochet')} className={categoryParam === 'crochet' ? 'active' : ''}>Crochet</button>
      </div>

      <div className="grid">
        {filtered.length > 0 ? (
          filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <div className="no-results">
            <span className="no-results-icon">🔍</span>
            <p>No products found {searchQuery ? `for "${searchQuery}"` : `in "${categoryParam}"`}</p>
            <button onClick={() => { navigate('/'); setSearchQuery(''); }}>
              View All Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;