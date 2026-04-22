import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import { SkeletonGrid } from './SkeletonCard';
import './ProductList.css';
import API from '../api';

const ITEMS_PER_PAGE = 8;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get('category') || 'all';

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryParam, searchQuery, sortBy]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (categoryParam !== 'all') params.set('category', categoryParam);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (sortBy) params.set('sort', sortBy);
      params.set('page', currentPage);
      params.set('limit', ITEMS_PER_PAGE);

      const res = await API.get(`/api/products/?${params.toString()}`);

      if (Array.isArray(res.data)) {
        // Non-paginated fallback
        setProducts(res.data);
        setTotalCount(res.data.length);
        setTotalPages(Math.ceil(res.data.length / ITEMS_PER_PAGE) || 1);
      } else {
        setProducts(res.data.products || []);
        const total = res.data.totalProducts || res.data.total || 0;
        setTotalCount(total);
        setTotalPages(res.data.totalPages || Math.ceil(total / ITEMS_PER_PAGE) || 1);
      }
    } catch (err) {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [categoryParam, searchQuery, sortBy, currentPage]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(debounce);
  }, [fetchProducts]);

  const handleFilter = (cat) => {
    if (cat === 'all') navigate('/');
    else navigate(`/?category=${cat}`);
  };

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Smooth scroll to product section
    document.getElementById('product-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'resin', label: '🪩 Resin' },
    { key: 'embroidery', label: '🧵 Embroidery' },
    { key: 'sketch', label: '✏️ Sketch' },
    { key: 'crochet', label: '🧶 Crochet' },
  ];

  // Pagination helpers
  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);
    range.push(1);
    if (left > 2) range.push('...');
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push('...');
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  return (
    <div id="product-section" className="product-list">
      <div className="product-list-header">
        <h2>Our Products</h2>
        {!loading && totalCount > 0 && (
          <span className="product-count">{totalCount} product{totalCount !== 1 ? 's' : ''}</span>
        )}
      </div>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search products by name, description, or category..."
          value={searchQuery}
          onChange={handleSearch}
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
        )}
      </div>

      <div className="filter-sort-row">
        <div className="filter-buttons">
          {categories.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleFilter(key)}
              className={categoryParam === key ? 'active' : ''}
            >
              {label}
            </button>
          ))}
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

      {loading ? (
        <SkeletonGrid count={ITEMS_PER_PAGE} />
      ) : error ? (
        <p className="products-error">{error}</p>
      ) : products.length > 0 ? (
        <>
          <div className="grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ‹ Prev
              </button>

              {getPaginationRange().map((page, i) => (
                page === '...'
                  ? <span key={`ellipsis-${i}`} className="pagination-ellipsis">…</span>
                  : (
                    <button
                      key={page}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  )
              ))}

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next ›
              </button>
            </div>
          )}
        </>
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
  );
};

export default ProductList;