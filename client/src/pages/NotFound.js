import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <div className="notfound-emoji">🌙</div>
        <h1 className="notfound-code">404</h1>
        <h2 className="notfound-title">Page Not Found</h2>
        <p className="notfound-text">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back to exploring beautiful handmade creations.
        </p>
        <div className="notfound-actions">
          <Link to="/" className="notfound-btn notfound-btn--primary">
            ← Back to Shop
          </Link>
          <Link to="/contact" className="notfound-btn notfound-btn--secondary">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
