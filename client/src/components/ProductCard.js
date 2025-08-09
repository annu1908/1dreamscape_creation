import React from 'react';
import './ProductCard.css';
import { toast } from 'react-toastify';
import { useFavorites } from '../context/FavoritesContext';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, onAddToCart }) => {
  const { favorites, toggleFavorite } = useFavorites();

  // Updated check for favorited item
  const isFavorited = favorites.some(fav => fav._id === product._id);

  return (
    <div className='product-card'>
      <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="image-container">
          <img src={product.image} alt={product.title} />
          <span
            className={`heart-icon ${isFavorited ? 'favorited' : ''}`}
            onClick={(e) => {
              e.preventDefault(); // Stops redirect to detail page when clicking heart
              toggleFavorite(product); // ✅ Send full product
              toast.success(
                isFavorited
                  ? 'Removed from wishlist'
                  : 'Added to wishlist',
                {
                  position: "top-right",
                  autoClose: 1500,
                }
              );
            }}
          >
            {isFavorited ? '❤️' : '🤍'}
          </span>
        </div>
        <h3>{product.title}</h3>
        
        <p>₹{product.price}</p>
      </Link>

      <button
        onClick={() => {
          onAddToCart(product);
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