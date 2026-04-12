import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animations after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const navigate = useNavigate();

  const categories = [
    { icon: '🧵', label: 'Embroidery', value: 'embroidery' },
    { icon: '💎', label: 'Resin Art', value: 'resin' },
    { icon: '✏️', label: 'Sketches', value: 'sketch' },
    { icon: '🧶', label: 'Crochet', value: 'crochet' },
  ];

  const handleCategoryClick = (value) => {
    navigate(`/?category=${value}`);
    setTimeout(() => {
      document.getElementById('product-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

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
          <span className="hero__badge">✨ Handcrafted with Love</span>

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

          {/* Category badges */}
          <div className="hero__categories">
            {categories.map((cat, i) => (
              <div
                key={cat.label}
                className="hero__category"
                style={{ animationDelay: `${0.8 + i * 0.1}s`, cursor: 'pointer' }}
                onClick={() => handleCategoryClick(cat.value)}
              >
                <span className="hero__category-icon">{cat.icon}</span>
                <span className="hero__category-label">{cat.label}</span>
              </div>
            ))}
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
            <span className="hero__float-card-icon">🎨</span>
            <div>
              <strong>100+</strong>
              <span>Unique Designs</span>
            </div>
          </div>
          <div className="hero__float-card hero__float-card--bottom">
            <span className="hero__float-card-icon">💝</span>
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