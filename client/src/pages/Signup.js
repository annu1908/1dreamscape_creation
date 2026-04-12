import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
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
    setIsError(false);

    try {
      await API.post('/api/auth/signup', formData);
      setMessage('Account created successfully! Redirecting to login...');
      setFormData({ name: '', email: '', password: '' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage(err.response?.data?.message || 'Signup failed. Email might already be in use.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-master-container auth-master-container--centered">

        {/* Right Side: Form Panel */}
        <div className="auth-form-panel">
          <div className="auth-form-header">
            <h3>Create an Account</h3>
            <p>Sign up now to start shopping unique creations.</p>
          </div>

          {message && (
            <div className={`auth-alert ${isError ? 'auth-alert-error' : 'auth-alert-success'}`}>
              {message}
            </div>
          )}

          {/* Social Auth Mock Buttons */}
          <div className="auth-social-group">
            <button type="button" className="auth-social-btn" onClick={() => alert('Google signup coming soon!')}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" />
              Sign up with Google
            </button>
          </div>

          <div className="auth-separator">
            <span>or sign up with email</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="name" 
                placeholder="John Doe" 
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>

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
                placeholder="Create a strong password" 
                value={formData.password}
                onChange={handleChange}
                required 
                minLength="6"
              />
            </div>

            <button type="submit" className="auth-submit-btn">Create Account</button>
          </form>

          <p className="auth-redirect">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;