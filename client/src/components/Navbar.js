import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import ThemeToggle from './ThemeToggle';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { cartCount } = useCart();

  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  let user = null;
  let userInitial = '';

  if (userData && userData !== 'undefined') {
    try {
      user = JSON.parse(userData);
      if (user && user.name) {
        userInitial = user.name.charAt(0).toUpperCase();
      }
    } catch (error) {
      console.error('Invalid user data in localStorage:', error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className={`menu-toggle ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle Menu">
          <div className="hamburger-box">
            <div className="hamburger-inner"></div>
          </div>
        </button>
        <Link to="/" className="logo">
          Dreamscape <span className="logo-accent">Creation</span>
        </Link>
      </div>

      <div className="navbar-right">
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>Contact</Link>
          <Link to="/wishlist" className="nav-link" onClick={() => setMenuOpen(false)}>Wishlist</Link>

          {!token ? (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="nav-link" onClick={() => setMenuOpen(false)}>Signup</Link>
            </>
          ) : (
            <>
              <Link to="/profile" className="nav-link mobile-only" onClick={() => setMenuOpen(false)}>My Profile</Link>
              {user && user.role === 'admin' && (
                <Link to="/admin" className="nav-link mobile-only" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
              )}
              <Link to="/orders" className="nav-link" onClick={() => setMenuOpen(false)}>My Orders</Link>

              {/* Desktop initial + dropdown */}
              <div className="user-dropdown desktop-only">
                <div className="user-initial-circle" onClick={toggleDropdown}>
                  {userInitial}
                </div>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>👤 My Profile</Link>
                    <Link to="/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>📦 My Orders</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)}>⚙️ Admin Panel</Link>
                    )}
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item dropdown-logout" onClick={handleLogout}>🚪 Sign Out</div>
                  </div>
                )}
              </div>

              {/* Mobile direct logout */}
              <div className="logout mobile-only" onClick={handleLogout}>Logout</div>
            </>
          )}
        </div>

        <div className="navbar-cart">
          <Link to="/cart" className="cart-icon">
            🛒
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>
          <ThemeToggle />
        </div>
      </div>
      {menuOpen && <div className="nav-backdrop" onClick={() => setMenuOpen(false)}></div>}
    </nav>
  );
};

export default Navbar;