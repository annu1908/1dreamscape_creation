import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(savedFavorites);
    
    axios.get('/api/products')
      .then(res => setAllProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  const favoriteProducts = allProducts.filter(product => favorites.includes(product._id));

  return (
    <div>
      <h2>My Favorites ❤️</h2>
      <div className="product-list">
        {favoriteProducts.length > 0 ? (
          favoriteProducts.map(product => <ProductCard key={product._id} product={product} />)
        ) : (
          <p>No favorites added yet.</p>
        )}
      </div>
    </div>
  );
};

export default Favorites;