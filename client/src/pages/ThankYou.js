import React from 'react';
import { Link } from 'react-router-dom';
import './ThankYouPage.css';

const ThankYouPage = () => {
  return (
    <div className="thankyou-container">
      <div className="thankyou-box">
        <h2>Thank You for Your Order! 🛍️</h2>
        <p>Your order has been placed successfully.</p>
        
        <p>We appreciate your support! ❤️</p>

        <Link to="/" className="home-btn">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default ThankYouPage;