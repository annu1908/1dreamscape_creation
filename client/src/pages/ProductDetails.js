import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './ProductDetails.css'; 
import { toast } from 'react-toastify';
import { useFavorites } from '../context/FavoritesContext'; // ⬅️ Import context

const ProductDetails = ({ onAddToCart }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { favorites, toggleFavorite } = useFavorites(); // ⬅️ Use favorites context

  useEffect(() => {
    // Fetch product by ID
    fetch(`http://localhost:5000/api/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(err => console.error('Error fetching product:', err));
  }, [id]);

  // Check if this product is already in favorites
  const isFavorited = favorites.some(item => item._id === id);

  if (!product) return <div>Loading...</div>;

  return (
    <div className="product-details">
      <Link to="/" style={{ textDecoration: 'none', color: '#ff5252' }}>⬅ Back to Shop</Link>
      <img src={product.image} alt={product.title} />
      <div className="info">
        <h2>{product.title}</h2>
        <p><strong>Category:</strong> {product.category}</p>
        <p><strong>Description:</strong> {product.description}</p>
        <p><strong>Price:</strong> ₹{product.price}</p>
        <div className="actions">
          <button onClick={() => {
            onAddToCart(product);
            toast.success("Added to cart!", { autoClose: 1500 });
          }}>
            Add to Cart
          </button>
          <button onClick={() => {
            toggleFavorite(product);
            toast.success(isFavorited ? "Removed from Wishlist" : "Added to Wishlist", { autoClose: 1500 });
          }}>
            {isFavorited ? '❤️ Favorited' : '🤍 Favorite'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;