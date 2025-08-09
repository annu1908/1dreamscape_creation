import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');

    const form = e.target;
    const data = new FormData(form);

    const response = await fetch('https://formspree.io/f/xzzgybnb', {
      method: 'POST',
      body: data,
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      form.reset();
      setStatus('Thanks! Your message has been sent.');
    } else {
      setStatus('Oops! Something went wrong.');
    }
  };

  return (
    <div className="contact-container">
      <h2>Contact Us</h2>
      <form onSubmit={handleSubmit} className="contact-form">
        <label>Name</label>
        <input type="text" name="name" required />

        <label>Email</label>
        <input type="email" name="email" required />

        <label>Message</label>
        <textarea name="message" rows="5" required></textarea>

        <button type="submit">Send Message</button>
        <p className="form-status">{status}</p>
      </form>
    </div>
  );
};

export default Contact;