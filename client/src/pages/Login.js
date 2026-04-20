import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      const response = await API.post('/api/auth/login', formData);
      const { token, name, email, role } = response.data;

      // Use AuthContext to store auth state
      login(token, { name, email, role });

      setMessage('Login successful! Redirecting...');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-master-container auth-master-container--centered">
        {/* Right Side: Form Panel */}
        <div className="auth-form-panel">
          <div className="auth-form-header">
            <h3>Sign in to Dreamscape</h3>
            <p>Welcome back! Please enter your details.</p>
          </div>

          {message && (
            <div className={`auth-alert ${isError ? 'auth-alert-error' : 'auth-alert-success'}`}>
              {message}
            </div>
          )}



          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email" 
                placeholder="Enter your email" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
            
            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                name="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={handleChange}
                required 
              />
            </div>



            <button type="submit" className="auth-submit-btn">Sign In</button>
          </form>

          <p className="auth-redirect">
            Don't have an account? <Link to="/signup">Sign up for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;