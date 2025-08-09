import React from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { Link } from 'react-router-dom';
import './Wishlist.css'; // optional styling

const Wishlist = () => {
  const { favorites, toggleFavorite } = useFavorites();

  if (favorites.length === 0) {
    return <div className="wishlist-empty">Your wishlist is empty ❤️</div>;
  }

  return (
    <div className="wishlist-container">
      <h2>My Wishlist</h2>
      <div className="wishlist-grid">
        {favorites.map(product => (
          <div className="wishlist-item" key={product._id}>
            <Link to={`/product/${product._id}`} className="wishlist-link">
              <img src={product.image} alt={product.title} />
              <h3>{product.title}</h3>
              <p>₹{product.price}</p>
            </Link>
            <button onClick={() => toggleFavorite(product)}>Remove </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;