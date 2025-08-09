import React, { useState } from 'react';

import './Auth.css'; // Reuse signup styles
import { useNavigate } from 'react-router-dom';
import API from '../api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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
      const response = await API.post('/api/auth/login', formData);

      const { token, name, email } = response.data;

      // ✅ Save token and user info in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ name, email }));

      setMessage('✅ Login successful!');
      navigate('/'); // Redirect to homepage or admin dashboard
    } catch (err) {
      console.error(err);
      setMessage('❌ Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {message && <p className="auth-message">{message}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
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
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;