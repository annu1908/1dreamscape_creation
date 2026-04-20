import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('Sending...');

    const form = e.target;
    const data = new FormData(form);

    try {
      const response = await fetch('https://formspree.io/f/xzzgybnb', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        form.reset();
        setStatus('Thanks! Your message has been sent successfully.');
      } else {
        setStatus('Oops! Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('Oops! Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Get in Touch</h1>
        <p>Whether you have a question about our products, pricing, or anything else, our team is ready to answer all your questions.</p>
      </div>

      <div className="contact-layout">
        <div className="contact-info-panel">
          <div className="info-block">
            <span className="info-icon">📍</span>
            <div>
              <h3>Our Studio</h3>
              <p>Dreamscape Creations<br/>Handcrafted in India 🇮🇳</p>
            </div>
          </div>
          
          <div className="info-block">
            <span className="info-icon">📞</span>
            <div>
              <h3>WhatsApp</h3>
              <p><a href="https://wa.me/919817800613" style={{color: 'inherit', textDecoration: 'underline'}}>+91 98178 00613</a><br/><span className="info-sub">Chat with us anytime</span></p>
            </div>
          </div>

          <div className="info-block">
            <span className="info-icon">✉️</span>
            <div>
              <h3>Email Address</h3>
              <p><a href="mailto:annu02sandhu@gmail.com" style={{color: 'inherit', textDecoration: 'underline'}}>annu02sandhu@gmail.com</a><br/><span className="info-sub">We usually reply within 24 hours</span></p>
            </div>
          </div>
        </div>

        <div className="contact-form-panel">
          <form onSubmit={handleSubmit} className="contact-form">
            <h2>Send us a Message</h2>
            
            <div className="form-group row">
              <div className="input-group">
                <label>First Name</label>
                <input type="text" name="firstName" placeholder="Jane" required />
              </div>
              <div className="input-group">
                <label>Last Name</label>
                <input type="text" name="lastName" placeholder="Doe" required />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" placeholder="jane@example.com" required />
            </div>

            <div className="form-group">
              <label>Your Message</label>
              <textarea name="message" rows="5" placeholder="How can we help you?" required></textarea>
            </div>

            <button type="submit" className={`submit-btn ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
            {status && <p className={`form-status ${status.includes('Oops') ? 'error' : 'success'}`}>{status}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;