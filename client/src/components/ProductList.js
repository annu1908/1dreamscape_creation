import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import { SkeletonGrid } from './SkeletonCard';
import './ProductList.css';
import API from '../api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const location = useLocation();
  const navigate = useNavigate();

  // Extract category from URL
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get('category') || 'all';

  // Fetch products whenever filters change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (categoryParam !== 'all') params.set('category', categoryParam);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (sortBy) params.set('sort', sortBy);

      const res = await API.get(`/api/products/?${params.toString()}`);
      // Handle both paginated and non-paginated responses
      const data = Array.isArray(res.data) ? res.data : res.data.products;
      setProducts(data || []);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [categoryParam, searchQuery, sortBy]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProducts();
    }, 300); // Debounce search
    return () => clearTimeout(debounce);
  }, [fetchProducts]);

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

  if (loading) return <div className="product-list"><h2>Our Products</h2><SkeletonGrid count={8} /></div>;
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

      <div className="filter-sort-row">
        <div className="filter-buttons">
          <button onClick={() => handleFilter('all')} className={categoryParam === 'all' ? 'active' : ''}>All</button>
          <button onClick={() => handleFilter('resin')} className={categoryParam === 'resin' ? 'active' : ''}>Resin</button>
          <button onClick={() => handleFilter('embroidery')} className={categoryParam === 'embroidery' ? 'active' : ''}>Embroidery</button>
          <button onClick={() => handleFilter('sketch')} className={categoryParam === 'sketch' ? 'active' : ''}>Sketch</button>
          <button onClick={() => handleFilter('crochet')} className={categoryParam === 'crochet' ? 'active' : ''}>Crochet</button>
        </div>

        <div className="sort-dropdown">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </div>
      </div>

      <div className="grid">
        {products.length > 0 ? (
          products.map((product) => (
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