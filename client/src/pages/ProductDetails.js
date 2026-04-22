import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import './ProductDetails.css';
import { toast } from 'react-toastify';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import { getImageUrl } from '../utils/imageUtils';

/* ── Star Rating ── */
const StarRating = ({ rating, onRate, interactive = false }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`star ${s <= (hovered || rating) ? 'star--filled' : ''} ${interactive ? 'star--interactive' : ''}`}
          onClick={() => interactive && onRate(s)}
          onMouseEnter={() => interactive && setHovered(s)}
          onMouseLeave={() => interactive && setHovered(0)}
        >★</span>
      ))}
    </div>
  );
};

/* ── Trust Badge ── */
const TrustBadge = ({ icon, text }) => (
  <div className="trust-badge">
    <span className="trust-badge__icon">{icon}</span>
    <span className="trust-badge__text">{text}</span>
  </div>
);

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  /* Gallery */
  const [activeImage, setActiveImage] = useState(null);
  const [zoomOpen, setZoomOpen] = useState(false);

  /* UX */
  const [qty, setQty] = useState(1);
  const [copied, setCopied] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);

  /* Related / Recent */
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  /* Reviews */
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const fetchReviews = useCallback(async () => {
    try {
      const res = await API.get(`/api/reviews/${id}`);
      setReviews(res.data.reviews || []);
      setAvgRating(res.data.avgRating || 0);
      setTotalReviews(res.data.totalReviews || 0);
    } catch { /* silent */ }
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveImage(null);
    setQty(1);

    API.get(`/api/products/${id}`)
      .then(res => {
        const p = res.data;
        setProduct(p);
        setActiveImage(getImageUrl(p.image));

        /* Recently viewed */
        try {
          const key = 'recentlyViewed';
          const saved = JSON.parse(localStorage.getItem(key) || '[]');
          const filtered = saved.filter(item => item._id !== p._id);
          const updated = [
            { _id: p._id, title: p.title, price: p.price, image: p.image },
            ...filtered,
          ].slice(0, 6);
          localStorage.setItem(key, JSON.stringify(updated));
          setRecentlyViewed(updated.filter(item => item._id !== p._id).slice(0, 5));
        } catch { /* silent */ }

        /* Related */
        if (p.category) {
          API.get(`/api/products/?category=${p.category}`)
            .then(r => {
              const data = Array.isArray(r.data) ? r.data : r.data.products;
              setRelatedProducts((data || []).filter(x => x._id !== id).slice(0, 4));
            })
            .catch(() => {});
        }
      })
      .catch(err => console.error(err));

    fetchReviews();
  }, [id, fetchReviews]);

  /* Handlers */
  const handleAddToCart = () => {
    addToCart({ ...product, quantity: qty });
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
    toast.success(`${product.title} added to cart!`, { autoClose: 1500, position: 'top-right' });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${product.title} — ₹${product.price}\n${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.rating) { setReviewError('Please select a star rating.'); return; }
    if (!reviewForm.comment.trim()) { setReviewError('Please write a comment.'); return; }
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
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  /* Derived */
  const isFavorited = favorites.some(f => f._id === id);
  const formatDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const allImages = product
    ? [...new Set([getImageUrl(product.image), ...(product.images || []).map(getImageUrl)].filter(Boolean))]
    : [];

  const discountPct = product?.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;


  /* Loading */
  if (!product) {
    return (
      <div className="pd-loading">
        <div className="pd-loading__spinner" />
        <p>Loading product…</p>
      </div>
    );
  }

  return (
    <div className="pd-page">

      {/* ── Breadcrumbs ── */}
      <nav className="pd-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="pd-breadcrumbs__sep">›</span>
        {product.category && (
          <>
            <Link to={`/?category=${product.category.toLowerCase()}`}>{product.category}</Link>
            <span className="pd-breadcrumbs__sep">›</span>
          </>
        )}
        <span className="pd-breadcrumbs__current">{product.title}</span>
      </nav>

      {/* ── Main Product Section ── */}
      <div className="pd-main">

        {/* LEFT — Image Gallery */}
        <div className="pd-gallery">
          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div className="pd-gallery__thumbs">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  className={`pd-gallery__thumb ${activeImage === img ? 'active' : ''}`}
                  onClick={() => setActiveImage(img)}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={img} alt={`${product.title} view ${i + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="pd-gallery__main" onClick={() => setZoomOpen(true)} role="button" tabIndex={0} aria-label="Click to zoom">
            <img
              src={activeImage || getImageUrl(product.image)}
              alt={product.title}
              className="pd-gallery__main-img"
              loading="eager"
            />
            {discountPct && (
              <span className="pd-gallery__badge pd-gallery__badge--discount">−{discountPct}%</span>
            )}
            <div className="pd-gallery__zoom-hint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              Zoom
            </div>
          </div>
        </div>

        {/* RIGHT — Product Info */}
        <div className="pd-info">

          {/* Category pill */}
          {product.category && (
            <Link to={`/?category=${product.category.toLowerCase()}`} className="pd-category-pill">
              {product.category}
            </Link>
          )}

          {/* Title */}
          <h1 className="pd-title">{product.title}</h1>

          {/* Rating row */}
          {totalReviews > 0 && (
            <div className="pd-rating-row">
              <StarRating rating={Math.round(avgRating)} />
              <span className="pd-rating-text">
                <strong>{Number(avgRating).toFixed(1)}</strong>
                <span> ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="pd-divider" />

          {/* Price */}
          <div className="pd-price-row">
            <span className="pd-price">₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="pd-original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
            {discountPct && (
              <span className="pd-save-tag">Save {discountPct}%</span>
            )}
          </div>

          {/* Made to Order — always */}
          <div className="pd-stock stock--made-to-order">
            <span className="pd-stock__dot" />
            Made to Order
          </div>

          {/* Description */}
          {product.description && (
            <p className="pd-description">{product.description}</p>
          )}

          {/* Divider */}
          <div className="pd-divider" />

          {/* Quantity + CTA */}
          <div className="pd-cta-row">
            <div className="pd-qty">
              <button
                className="pd-qty__btn"
                onClick={() => setQty(q => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
              >−</button>
              <span className="pd-qty__val">{qty}</span>
              <button
              className="pd-qty__btn"
              onClick={() => setQty(q => q + 1)}
              aria-label="Increase quantity"
            >+</button>
            </div>

            <button
              className={`pd-add-btn ${addedAnim ? 'pd-add-btn--added' : ''}`}
              onClick={handleAddToCart}
              disabled={false}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {addedAnim ? 'Added!' : 'Add to Cart'}
            </button>

            <button
              className={`pd-wish-btn ${isFavorited ? 'pd-wish-btn--active' : ''}`}
              onClick={() => {
                toggleFavorite(product);
                toast.success(isFavorited ? 'Removed from Wishlist' : 'Added to Wishlist', { autoClose: 1000 });
              }}
              aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>

          {/* Trust badges */}
          <div className="pd-trust-strip">
            <TrustBadge icon="🚚" text="Free shipping on ₹999+" />
            <TrustBadge icon="🔒" text="Secure payment" />
            <TrustBadge icon="↩️" text="Easy returns" />
          </div>

          {/* Info Accordion */}
          <div className="pd-accordion">
            <details open>
              <summary>Product Details</summary>
              <div className="pd-accordion__body">
                <table className="pd-info-table">
                  <tbody>
                    <tr><td>Category</td><td>{product.category || 'Handcrafted'}</td></tr>
                    <tr><td>Made in</td><td>India 🇮🇳</td></tr>
                    <tr><td>Availability</td><td>Made to Order ✨</td></tr>
                    <tr><td>SKU</td><td>#{id.slice(-8).toUpperCase()}</td></tr>
                  </tbody>
                </table>
              </div>
            </details>
            <details>
              <summary>Care &amp; Handling</summary>
              <div className="pd-accordion__body">
                <ul className="pd-accordion__list">
                  <li>Each piece is handcrafted — handle with care</li>
                  <li>Keep resin items away from direct sunlight</li>
                  <li>Clean gently with a soft, slightly damp cloth</li>
                  <li>Store in a cool, dry place when not in use</li>
                </ul>
              </div>
            </details>
            <details>
              <summary>Shipping &amp; Delivery</summary>
              <div className="pd-accordion__body">
                <ul className="pd-accordion__list">
                  <li>Dispatched within 2–4 business days</li>
                  <li>Delivery in 5–8 business days across India</li>
                  <li>Flat ₹50 shipping charge per order</li>
                  <li>Packaged carefully to prevent damage</li>
                </ul>
              </div>
            </details>
          </div>

          {/* Share */}
          <div className="pd-share">
            <span className="pd-share__label">Share:</span>
            <button className="pd-share__btn pd-share__btn--wa" onClick={handleWhatsApp} aria-label="Share on WhatsApp">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </button>
            <button className="pd-share__btn pd-share__btn--copy" onClick={handleCopyLink} aria-label="Copy link">
              {copied
                ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> Copy Link</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── Zoom Lightbox ── */}
      {zoomOpen && (
        <div className="pd-lightbox" onClick={() => setZoomOpen(false)}>
          <button className="pd-lightbox__close" onClick={() => setZoomOpen(false)} aria-label="Close">✕</button>
          <img
            src={activeImage || getImageUrl(product.image)}
            alt={product.title}
            className="pd-lightbox__img"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── Reviews ── */}
      <section className="pd-reviews">
        <div className="pd-reviews__header">
          <h2>Customer Reviews</h2>
          {totalReviews > 0 && (
            <div className="pd-reviews__summary">
              <span className="pd-reviews__avg">{Number(avgRating).toFixed(1)}</span>
              <div>
                <StarRating rating={Math.round(avgRating)} />
                <span className="pd-reviews__count">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Write review */}
        {isAuthenticated ? (
          <form className="pd-review-form" onSubmit={handleSubmitReview}>
            <h3>Write a Review</h3>
            <div className="pd-review-form__rating">
              <label>Your Rating</label>
              <StarRating
                rating={reviewForm.rating}
                onRate={r => setReviewForm({ ...reviewForm, rating: r })}
                interactive
              />
            </div>
            <textarea
              className="pd-review-form__textarea"
              placeholder="Share your experience with this product…"
              value={reviewForm.comment}
              onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
              maxLength={500}
              rows={4}
            />
            <div className="pd-review-form__footer">
              <span className="pd-review-form__count">{reviewForm.comment.length}/500</span>
              <button type="submit" className="pd-review-form__submit" disabled={reviewLoading}>
                {reviewLoading ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
            {reviewError && <p className="pd-review-form__error">{reviewError}</p>}
          </form>
        ) : (
          <div className="pd-review-login">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span><Link to="/login">Log in</Link> to write a review</span>
          </div>
        )}

        {/* Review cards */}
        {reviews.length > 0 ? (
          <div className="pd-reviews__list">
            {reviews.map(r => (
              <div key={r._id} className="pd-review-card">
                <div className="pd-review-card__top">
                  <div className="pd-review-card__user">
                    <div className="pd-review-card__avatar">{r.userName.charAt(0).toUpperCase()}</div>
                    <div>
                      <strong>{r.userName}</strong>
                      <span>{formatDate(r.createdAt)}</span>
                    </div>
                  </div>
                  <StarRating rating={r.rating} />
                </div>
                <p className="pd-review-card__comment">{r.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="pd-reviews__empty">No reviews yet — be the first to review this product!</p>
        )}
      </section>

      {/* ── Related Products ── */}
      {relatedProducts.length > 0 && (
        <section className="pd-related">
          <h2>You May Also Like</h2>
          <div className="pd-related__grid">
            {relatedProducts.map(rp => (
              <Link to={`/product/${rp._id}`} key={rp._id} className="pd-related__card">
                <div className="pd-related__img-wrap">
                  <img src={getImageUrl(rp.image)} alt={rp.title} loading="lazy" />
                </div>
                <div className="pd-related__info">
                  <h4>{rp.title}</h4>
                  <span>₹{rp.price?.toLocaleString('en-IN')}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Recently Viewed ── */}
      {recentlyViewed.length > 0 && (
        <section className="pd-related pd-related--recent">
          <h2>Recently Viewed</h2>
          <div className="pd-related__grid">
            {recentlyViewed.map(rv => (
              <Link to={`/product/${rv._id}`} key={rv._id} className="pd-related__card">
                <div className="pd-related__img-wrap">
                  <img src={getImageUrl(rv.image)} alt={rv.title} loading="lazy" />
                </div>
                <div className="pd-related__info">
                  <h4>{rv.title}</h4>
                  <span>₹{rv.price?.toLocaleString('en-IN')}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetails;