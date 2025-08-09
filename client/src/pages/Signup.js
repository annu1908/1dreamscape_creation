import React, { useState } from 'react';

import './Auth.css'; // optional CSS
import API from '../api';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await API.post('/api/auth/signup', formData);
      setMessage('✅ Signup successful! Now you can login.');
      setFormData({ name: '', email: '', password: '' });
    } catch (err) {
      console.error(err);
      setMessage('❌ Signup failed. Email might already be in use.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      {message && <p className="auth-message">{message}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <input 
          type="text" 
          name="name" 
          placeholder="Name" 
          value={formData.name}
          onChange={handleChange}
          required 
        />
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={formData.email}
          onChange={handleChange}
          required 
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          value={formData.password}
          onChange={handleChange}
          required 
        />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
};

export default Signup;