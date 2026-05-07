import React from 'react';
import './ProductCard.css';
import { toast } from 'react-toastify';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';

const ProductCard = ({ product }) => {
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();

  const isFavorited = favorites.some(fav => fav._id === product._id);
  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className='product-card'>
      <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="image-container">
          <img src={getImageUrl(product.image)} alt={product.title} loading="lazy" />
          {discountPct && <span className="discount-badge">-{discountPct}%</span>}
          <span
            className={`heart-icon ${isFavorited ? 'favorited' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(product);
              toast.success(
                isFavorited ? 'Removed from wishlist' : 'Added to wishlist',
                { position: "top-right", autoClose: 1500 }
              );
            }}
          >
            {isFavorited
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            }
          </span>
        </div>
        <div className="product-info">
          <h3>{product.title}</h3>
          <div className="product-price-row">
            <p className="price">₹{product.price}</p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="original-price">₹{product.originalPrice}</p>
            )}
          </div>
        </div>
      </Link>

      <button
        onClick={() => {
          addToCart(product);
          toast.success("Product is added to cart", {
            position: "top-right",
            autoClose: 2000,
          });
        }}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;