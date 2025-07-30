import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Dreamscape Creations</p>
        <p>Handcrafted with 💖 in India</p>
        <div className="footer-links">
          <a href="https://www.instagram.com/dreamscape_creation/?igsh=ZHBraXY4eTZvajIy&utm_source=qr#">Instagram</a>
          <a href="https://wa.me/919817800613">WhatsApp</a>
          <a href="mailto:annu02sandhu@gmail.com">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;