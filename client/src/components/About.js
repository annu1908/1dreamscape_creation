import React from 'react';
import './About.css';

import heroBg from '../assets/about_hero_bg.png';
import storyHands from '../assets/about_story_hands.png';
import founderPortrait from '../assets/about_founder_image.jpeg';

const About = () => {
  return (
    <div className="about-page">

      {/* 1. Hero Banner */}
      <section className="about-hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="about-hero-overlay">
          <h1 className="about-title">Handcrafted with Soul</h1>
          <p className="about-subtitle">Proudly Handmade in India</p>
        </div>
      </section>

      {/* 2. Our Story Section */}
      <section className="about-story-section">
        <div className="story-container">
          <div className="story-text">
            <h2>Our Story</h2>
            <p>
              What began as a quiet, personal <strong>creative escape</strong> organically blossomed into Dreamscape Creations.
              In a world dominated by mass production, there is something profoundly beautiful about slowing down and creating
              with intention.
            </p>
            <p>
              Every piece of embroidery, every drop of resin, and every crochet loop is born from a genuine love for the craft.
              We don't just make products; we pour our hearts into designing unique, tactile experiences that bring joy, warmth,
              and personality into your space.
            </p>
          </div>
          <div className="story-image">
            <img
              src={storyHands}
              alt="Artisan hands working on a craft"
            />
            <div className="story-image-backdrop"></div>
          </div>
        </div>
      </section>

      {/* 3. Core Values Grid */}
      <section className="about-values-section">
        <div className="values-header">
          <h2>Our Philosophy</h2>
          <p>The pillars behind every creation that leaves our studio.</p>
        </div>

        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">✨</div>
            <h3>Deeply Personal</h3>
            <p>No two items are exactly alike. Every creation carries the distinct, irreplaceable mark of the hands that made it, ensuring your piece belongs uniquely to you.</p>
          </div>

          <div className="value-card">
            <div className="value-icon">💝</div>
            <h3>Truly Special</h3>
            <p>We source the finest materials and labor over the smallest details. Our crafts are designed not just to be owned, but to be cherished and admired.</p>
          </div>

          <div className="value-card">
            <div className="value-icon">🕰️</div>
            <h3>Memorable</h3>
            <p>Whether it's a gift for a loved one or a statement piece for your living room, our goal is to create enduring artifacts that spark conversations and memories.</p>
          </div>
        </div>
      </section>

      {/* 4. Meet the Founder */}
      <section className="about-founder-section">
        <div className="founder-container">
          <div className="founder-image">
            <img
              src={founderPortrait}
              alt="Annu Sandhu, Founder of Dreamscape Creations"
            />
          </div>
          <div className="founder-info">
            <span className="founder-tag">The Creator</span>
            <h2>Annu Sandhu</h2>
            <p className="founder-quote">
              "Art has always been my sanctuary. I started Dreamscape Creations to share that sense of peace and magic with the world."
            </p>
            <p className="founder-bio">
              As the founder and lead artisan, Annu oversees every meticulous detail that goes into the store. What started as an individual pursuit of creative freedom has matured into a proudly Indian brand dedicated to celebrating the authentic beauty of handmade crafts.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;