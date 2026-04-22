import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import ThemeToggle from './ThemeToggle';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '';

  // Scroll shadow effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    window.location.reload();
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const NAV_LINKS = [
    { to: '/', label: 'Shop' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        {/* ── Left: Hamburger (mobile) + Logo ── */}
        <div className="navbar-left">
          {/* Mobile hamburger — left side */}
          <button
            className={`hamburger-btn ${menuOpen ? 'hamburger-btn--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>

          <Link to="/" className="navbar-logo">
            <img src={logo} alt="Dreamscape Creations" className="navbar-logo-img" />
          </Link>
        </div>

        {/* ── Centre: Nav Links (desktop) ── */}
        <div className="navbar-center">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${isActive(to) ? 'nav-link--active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* ── Right: Actions ── */}
        <div className="navbar-right">
          {/* Wishlist icon — desktop only, in drawer on mobile */}
          <Link to="/wishlist" className="nav-icon-btn nav-desktop-only" aria-label="Wishlist" title="Wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </Link>

          {/* Cart — shopping bag icon (boutique style) */}
          <Link to="/cart" className="nav-icon-btn nav-cart-btn" aria-label="Cart" title="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Auth: unauthenticated */}
          {!isAuthenticated && (
            <div className="nav-auth-btns">
              <Link to="/login" className="nav-btn nav-btn--ghost">Log in</Link>
              <Link to="/signup" className="nav-btn nav-btn--solid">Sign up</Link>
            </div>
          )}

          {/* Auth: authenticated — avatar + dropdown — desktop only */}
          {isAuthenticated && (
            <div className="user-dropdown nav-desktop-only" ref={dropdownRef}>
              <button
                className={`user-avatar-btn ${dropdownOpen ? 'user-avatar-btn--open' : ''}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="Account menu"
              >
                <span className="user-avatar-initial">{userInitial}</span>
                <svg className="avatar-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-user-info">
                    <div className="dropdown-avatar">{userInitial}</div>
                    <div>
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    My Profile
                  </Link>
                  <Link to="/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    My Orders
                  </Link>
                  <Link to="/wishlist" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    Wishlist
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="dropdown-item dropdown-item--admin" onClick={() => setDropdownOpen(false)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M21 12h-2M5 12H3M12 3V1M12 23v-2"/></svg>
                      Admin Panel
                    </Link>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item dropdown-item--logout" onClick={handleLogout}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${menuOpen ? 'mobile-drawer--open' : ''}`}>
        <div className="mobile-drawer-header">
          <img src={logo} alt="Dreamscape" className="mobile-drawer-logo" />
          <button className="mobile-drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close">✕</button>
        </div>
        <div className="mobile-drawer-links">
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} className={`mobile-nav-link ${isActive(to) ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              {label}
            </Link>
          ))}
          <Link to="/wishlist" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Wishlist</Link>
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>My Profile</Link>
              <Link to="/orders" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>My Orders</Link>
              {isAdmin && <Link to="/admin" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
              <button className="mobile-logout-btn" onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <div className="mobile-auth-btns">
              <Link to="/login" className="nav-btn nav-btn--ghost" onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link to="/signup" className="nav-btn nav-btn--solid" onClick={() => setMenuOpen(false)}>Sign up</Link>
            </div>
          )}
        </div>
      </div>
      {menuOpen && <div className="nav-backdrop" onClick={() => setMenuOpen(false)} />}
    </>
  );
};

export default Navbar;