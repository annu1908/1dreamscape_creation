import React from 'react';
import './CartPage.css';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUtils';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const deliveryCharge = 50;
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const total = subtotal + deliveryCharge;
  const navigate = useNavigate();

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty 😢</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <img src={item.image ? getImageUrl(item.image) : 'placeholder.jpg'} alt={item.title} className="cart-img" />
              <div className="cart-details">
                <h4>{item.title}</h4>
                <p>₹{item.price}</p>
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                </div>
              </div>
              <button className="remove-btn" onClick={() => removeFromCart(item._id)}>Remove</button>
            </div>
          ))}

          <div className="cart-summary">
            <p>Subtotal: ₹{subtotal}</p>
            <p>Delivery Charges: ₹{deliveryCharge}</p>
            <h3>Total: ₹{total}</h3>
            <button className="checkout-btn" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;