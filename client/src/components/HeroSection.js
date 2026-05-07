import React, { useEffect, useState } from 'react';

import './HeroSection.css';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animations after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);



  return (
    <section className={`hero ${isVisible ? 'hero--visible' : ''}`} id="hero">
      {/* Floating decorative particles */}
      <div className="hero__particles">
        {[...Array(6)].map((_, i) => (
          <span key={i} className={`hero__particle hero__particle--${i + 1}`} />
        ))}
      </div>

      <div className="hero__container">
        {/* Left content */}
        <div className="hero__content">
          <span className="hero__badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'4px',verticalAlign:'middle'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Handcrafted with Love</span>

          <h1 className="hero__title">
            <span className="hero__title-line">Welcome to</span>
            <span className="hero__title-line hero__title-line--accent">
              Dreamscape
            </span>
            <span className="hero__title-line hero__title-line--script">
              Creations
            </span>
          </h1>

          <p className="hero__subtitle">
            Discover unique, handmade treasures — from delicate embroidery and
            mesmerizing resin art to intricate sketches and cozy crochet pieces.
            Each creation tells a story.
          </p>

          <div className="hero__actions">
            <button 
              onClick={() => document.getElementById('product-list')?.scrollIntoView({ behavior: 'smooth' })} 
              className="hero__btn hero__btn--primary"
            >
              <span>Shop Collection</span>
              <svg
                className="hero__btn-arrow"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <button 
              onClick={() => document.getElementById('product-list')?.scrollIntoView({ behavior: 'smooth' })} 
              className="hero__btn hero__btn--secondary"
            >
              Explore Categories
            </button>
          </div>


        </div>

        {/* Right image */}
        <div className="hero__visual">
          <div className="hero__image-wrapper">
            <img
              src="/hero-bg.png"
              alt="Handmade crafts collection — embroidery, resin art, sketches and crochet"
              className="hero__image"
            />
            <div className="hero__image-overlay" />
          </div>

          {/* Floating stat cards */}
          <div className="hero__float-card hero__float-card--top">
            <span className="hero__float-card-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg></span>
            <div>
              <strong>100+</strong>
              <span>Unique Designs</span>
            </div>
          </div>
          <div className="hero__float-card hero__float-card--bottom">
            <span className="hero__float-card-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></span>
            <div>
              <strong>Handmade</strong>
              <span>With Care</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button 
        onClick={() => document.getElementById('product-section')?.scrollIntoView({ behavior: 'smooth' })} 
        className="hero__scroll" 
        aria-label="Scroll to products"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <span className="hero__scroll-text">Scroll</span>
        <span className="hero__scroll-line" />
      </button>
    </section>
  );
};

export default HeroSection;