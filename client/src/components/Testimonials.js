import React, { useState, useEffect, useRef } from "react";
import "./Testimonials.css";

const testimonials = [
  {
    name: "Neha Sharma",
    location: "Mumbai",
    rating: 5,
    review: "The embroidered hoop was even more beautiful than I imagined! Every stitch was so precise and the packaging was absolutely lovely. A truly heartfelt piece of art.",
    product: "Embroidered Hoop",
    date: "March 2024",
    initial: "N",
    color: "#d86b94",
  },
  {
    name: "Ritika Mehra",
    location: "Delhi",
    rating: 5,
    review: "The detailing in the resin piece was outstanding. It arrived safely and looked exactly like the photos — actually even better in person! Will definitely order again.",
    product: "Resin Art Piece",
    date: "February 2024",
    initial: "R",
    color: "#a855f7",
  },
  {
    name: "Aman Verma",
    location: "Bangalore",
    rating: 5,
    review: "Gave it as a gift and the reaction was priceless. Thank you for making something so personal and unique. The customisation was spot on!",
    product: "Custom Sketch",
    date: "January 2024",
    initial: "A",
    color: "#0ea5e9",
  },
  {
    name: "Priya Kapoor",
    location: "Pune",
    rating: 5,
    review: "Ordered a crochet piece as an anniversary gift and my partner was absolutely blown away. The quality is amazing and it feels like true artisan work.",
    product: "Crochet Gift",
    date: "April 2024",
    initial: "P",
    color: "#10b981",
  },
  {
    name: "Sneha Joshi",
    location: "Hyderabad",
    rating: 5,
    review: "I've ordered twice now and the consistency in quality is remarkable. Each piece feels unique and made with genuine love. Best handmade store I've found!",
    product: "Resin Keychain",
    date: "March 2024",
    initial: "S",
    color: "#f59e0b",
  },
  {
    name: "Rahul Gupta",
    location: "Chennai",
    rating: 5,
    review: "The sketch portrait was absolutely lifelike! I'm genuinely amazed at how talented the artist is. Framed it immediately and it looks stunning on my wall.",
    product: "Portrait Sketch",
    date: "February 2024",
    initial: "R",
    color: "#ef4444",
  },
];

const StarRow = ({ count = 5 }) => (
  <div className="tst-stars">
    {Array.from({ length: count }).map((_, i) => (
      <span key={i} className="tst-star">★</span>
    ))}
  </div>
);

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef(null);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActiveIndex(i => (i + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <section className="tst-section">
      {/* Header */}
      <div className="tst-header">
        <span className="tst-eyebrow">Testimonials</span>
        <h2 className="tst-title">Loved by customers across India</h2>
        <p className="tst-subtitle">
          Every piece is made with care — here's what our customers have to say.
        </p>
      </div>

      {/* Stats bar */}
      <div className="tst-stats">
        <div className="tst-stat">
          <strong>500+</strong><span>Happy Customers</span>
        </div>
        <div className="tst-stat-divider" />
        <div className="tst-stat">
          <strong>4.9 ★</strong><span>Average Rating</span>
        </div>
        <div className="tst-stat-divider" />
        <div className="tst-stat">
          <strong>100%</strong><span>Handcrafted</span>
        </div>
        <div className="tst-stat-divider" />
        <div className="tst-stat">
          <strong>50+</strong><span>Custom Orders</span>
        </div>
      </div>

      {/* Cards grid */}
      <div
        className="tst-grid"
        ref={trackRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {testimonials.map((t, i) => (
          <div
            key={i}
            className={`tst-card ${i === activeIndex ? 'tst-card--featured' : ''}`}
            onClick={() => setActiveIndex(i)}
          >
            <div className="tst-card__top">
              <div className="tst-avatar" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}>
                {t.initial}
              </div>
              <div className="tst-card__meta">
                <strong>{t.name}</strong>
                <span>{t.location}</span>
              </div>
              <div className="tst-verified">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
                </svg>
                Verified
              </div>
            </div>

            <StarRow count={t.rating} />

            <p className="tst-card__quote">"{t.review}"</p>

            <div className="tst-card__footer">
              <span className="tst-product-tag">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                {t.product}
              </span>
              <span className="tst-date">{t.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="tst-dots">
        {testimonials.map((_, i) => (
          <button
            key={i}
            className={`tst-dot ${i === activeIndex ? 'tst-dot--active' : ''}`}
            onClick={() => setActiveIndex(i)}
            aria-label={`Review ${i + 1}`}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="tst-cta">
        <p>Join our growing community of happy customers</p>
        <a href="/" className="tst-cta-btn">Shop Handcrafted Pieces →</a>
      </div>
    </section>
  );
};

export default Testimonials;