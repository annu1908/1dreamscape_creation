import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './ProductDetails.css';
import { toast } from 'react-toastify';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import API from '../api';

const StarRating = ({ rating, onRate, interactive = false }) => {
  const [hoveredStar, setHoveredStar] = useState(0);

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= (hoveredStar || rating) ? 'star--filled' : ''} ${interactive ? 'star--interactive' : ''}`}
          onClick={() => interactive && onRate(star)}
          onMouseEnter={() => interactive && setHoveredStar(star)}
          onMouseLeave={() => interactive && setHoveredStar(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const user = (() => {
    try {
      const data = localStorage.getItem('user');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  })();
  const token = localStorage.getItem('token');

  useEffect(() => {
    API.get(`/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error('Error fetching product:', err));

    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/api/reviews/${id}`);
      setReviews(res.data.reviews);
      setAvgRating(res.data.avgRating);
      setTotalReviews(res.data.totalReviews);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (reviewForm.rating === 0) {
      setReviewError('Please select a rating.');
      return;
    }
    if (!reviewForm.comment.trim()) {
      setReviewError('Please write a comment.');
      return;
    }

    setReviewLoading(true);
    setReviewError('');

    try {
      await API.post('/api/reviews', {
        productId: id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        userName: user?.name || 'Anonymous',
      });

      setReviewForm({ rating: 0, comment: '' });
      toast.success('Review submitted!', { autoClose: 1500 });
      fetchReviews();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review.';
      setReviewError(msg);
    } finally {
      setReviewLoading(false);
    }
  };

  const isFavorited = favorites.some(item => item._id === id);
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  if (!product) return <div className="loading-spinner"><div className="spinner"></div><p>Loading...</p></div>;

  return (
    <div className="product-details-page">
      <Link to="/" className="back-btn">⬅ Back to Shop</Link>
      
      <div className="product-details-container">
        <div className="product-image-section">
          <img src={product.image} alt={product.title} />
        </div>
        
        <div className="info">
          <h2>{product.title}</h2>
          
          {totalReviews > 0 && (
            <div className="product-rating-summary">
              <StarRating rating={Math.round(avgRating)} />
              <span className="rating-text">{avgRating} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
            </div>
          )}
          
          <div className="product-price">₹{product.price}</div>
          
          <div className="product-meta">
            <span className="category-tag">{product.category}</span>
          </div>
          
          <div className="product-description">
            <p>{product.description}</p>
          </div>
          
          <div className="actions">
            <button className="primary-btn" onClick={() => {
              addToCart(product);
              toast.success("Added to cart!", { autoClose: 1500 });
            }}>
              <span className="icon">🛍️</span> Add to Cart
            </button>
            <button className={`secondary-btn ${isFavorited ? 'favorited' : ''}`} onClick={() => {
              toggleFavorite(product);
              toast.success(isFavorited ? "Removed from Wishlist" : "Added to Wishlist", { autoClose: 1000 });
            }}>
              <span className="icon">{isFavorited ? '❤️' : '🤍'}</span> 
              {isFavorited ? 'Saved to Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h3>Customer Reviews</h3>

        {/* Review Form */}
        {token ? (
          <form className="review-form" onSubmit={handleSubmitReview}>
            <h4>Write a Review</h4>
            <div className="review-form-rating">
              <label>Your Rating:</label>
              <StarRating
                rating={reviewForm.rating}
                onRate={(r) => setReviewForm({ ...reviewForm, rating: r })}
                interactive
              />
            </div>
            <textarea
              placeholder="Share your experience with this product..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              maxLength={500}
              rows={4}
            />
            <div className="review-form-footer">
              <span className="char-count">{reviewForm.comment.length}/500</span>
              <button type="submit" disabled={reviewLoading}>
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
            {reviewError && <p className="review-error">{reviewError}</p>}
          </form>
        ) : (
          <div className="review-login-prompt">
            <p>💬 <Link to="/login">Log in</Link> to write a review.</p>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review._id} className="review-card">
                <div className="review-card-header">
                  <div className="review-user">
                    <span className="review-avatar">{review.userName.charAt(0).toUpperCase()}</span>
                    <div>
                      <strong>{review.userName}</strong>
                      <span className="review-date">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;