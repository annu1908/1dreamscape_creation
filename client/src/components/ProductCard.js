import React, { useState, useEffect } from 'react';
import './ProductCard.css';
import {toast} from 'react-toastify';
const ProductCard = ({ product ,onAddToCart}) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(saved);
  }, []);

  const toggleFavorite = (productId) => {
    let updated;
    if (favorites.includes(productId)) {
      updated = favorites.filter(id => id !== productId);
    } else {
      updated = [...favorites, productId];
    }
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const isFavorited = favorites.includes(product._id);

  return (
    
    <div className='product-card'>
      
      <div className="image-container">
        <img src={product.image} alt={product.title} />
        <span
          className={`heart-icon ${isFavorited ? 'favorited' : ''}`}
          onClick={(e) =>{
            e.preventDefault();
           toggleFavorite(product._id);}}
        >
          {isFavorited ? '❤️' : '🤍'}
        </span>
      </div>
      <h3>{product.title}</h3>
      <p>{product.category}</p>
      <p>₹{product.price}</p>
      <button onClick={()=>{
        onAddToCart(product);
      toast.success("Product is added to cart",{
        position:"top-right",
        autoClose:2000,
      });
      }
    }>Add to Cart
      </button>
      
    </div>
  );
};

export default ProductCard;