import React from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import './ThankYouPage.css';

const ThankYouPage = () => {
  const location =useLocation();
  const orderId =location.state?.orderId;
  return (
    <div className="thankyou-container">
      <div className="thankyou-box">
        <h2>Thank You for Your Order! 🛍️</h2>
        {orderId && <p>Your Order ID:<strong>{orderId}</strong></p>}
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