import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ cartCount }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
        <Link to="/" className="logo">Dreamscape Creation</Link>
      </div>
<div className='navbar-right'>
      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Shop</Link>
        <Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>About</Link>
        <Link to="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>Contact</Link>
      
      </div>

      <div className="navbar-cart">
        <Link to="/cart" className="cart-icon">
          🛒
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </Link>
        <ThemeToggle/>
      </div>
      </div>
      
    </nav>
  );
};

export default Navbar;