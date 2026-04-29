import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import './Auth.css';

// Robust email validation
const isValidEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!re.test(email)) return false;
  // Block common disposable / obviously fake patterns
  const blocked = ['test@test', 'fake@', 'asdf@', '123@'];
  if (blocked.some(b => email.toLowerCase().startsWith(b))) return false;
  const domain = email.split('@')[1] || '';
  // Must have a real TLD (at least 2 chars, no numbers only)
  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2 || /^\d+$/.test(tld)) return false;
  return true;
};

const EyeIcon = ({ show }) => show ? (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ color: '#d86b94' }}>
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ color: '#10b981' }}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const Signup = () => {
  const [step, setStep] = useState(1); // 1 = form, 2 = OTP, 3 = success
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error on change
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!isValidEmail(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. you@gmail.com).';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    } else if (!/[A-Za-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password should contain letters and at least one number.';
    }
    return newErrors;
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/api/auth/register', formData);
      setMessage(res.data.message);
      setIsError(false);
      setStep(2);
      startResendCooldown();
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!otp.trim() || otp.trim().length !== 6) {
      setIsError(true);
      setMessage('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/api/auth/verify-otp', { email: formData.email, otp: otp.trim() });
      setMessage(res.data.message);
      setIsError(false);
      setStep(3);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setMessage('');
    setIsError(false);
    setResendLoading(true);
    try {
      const res = await API.post('/api/auth/resend-otp', { email: formData.email });
      setMessage(res.data.message);
      setIsError(false);
      setOtp('');
      startResendCooldown();
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return null;
    if (pwd.length < 6) return { label: 'Too short', color: '#ef4444', width: '20%' };
    if (pwd.length < 8 || !/[0-9]/.test(pwd)) return { label: 'Weak', color: '#f59e0b', width: '40%' };
    if (pwd.length >= 8 && /[0-9]/.test(pwd) && /[A-Z]/.test(pwd)) return { label: 'Strong', color: '#10b981', width: '100%' };
    return { label: 'Good', color: '#3b82f6', width: '70%' };
  };

  const strength = getPasswordStrength(formData.password);

  // Mask email for display: show first 3 chars + mask + domain
  const maskEmail = (email) => {
    const [local, domain] = email.split('@');
    if (local.length <= 3) return email;
    return `${local.slice(0, 3)}${'•'.repeat(local.length - 3)}@${domain}`;
  };

  return (
    <div className="auth-page">
      <div className="auth-master-container auth-master-container--centered">
        <div className="auth-form-panel">

          {/* ============ STEP 1: Registration Form ============ */}
          {step === 1 && (
            <>
              <div className="auth-form-header">
                <h3>Create an Account</h3>
                <p>Sign up now to start shopping unique creations.</p>
              </div>

              {message && (
                <div className={`auth-alert ${isError ? 'auth-alert-error' : 'auth-alert-success'}`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSendOtp} className="auth-form" noValidate>
                <div className={`input-group ${errors.name ? 'input-error' : ''}`}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>

                <div className={`input-group ${errors.email ? 'input-error' : ''}`}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className={`input-group ${errors.password ? 'input-error' : ''}`}>
                  <label>Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon show={showPassword} />
                    </button>
                  </div>
                  {formData.password && strength && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div className="strength-fill" style={{ width: strength.width, background: strength.color }}></div>
                      </div>
                      <span className="strength-label" style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                  )}
                  {errors.password && <span className="field-error">{errors.password}</span>}
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>

              <p className="auth-redirect">
                Already have an account? <Link to="/login">Sign in</Link>
              </p>
            </>
          )}

          {/* ============ STEP 2: OTP Verification ============ */}
          {step === 2 && (
            <>
              <div className="otp-verify-section">
                <div className="otp-icon-wrapper">
                  <MailIcon />
                </div>
                <div className="auth-form-header" style={{ textAlign: 'center' }}>
                  <h3>Verify Your Email</h3>
                  <p>We've sent a 6-digit verification code to</p>
                  <p className="otp-email-display">{maskEmail(formData.email)}</p>
                </div>

                {message && (
                  <div className={`auth-alert ${isError ? 'auth-alert-error' : 'auth-alert-success'}`}>
                    {message}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="auth-form">
                  <div className="input-group">
                    <label>Enter OTP</label>
                    <input
                      type="text"
                      name="otp"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => {
                        // Only allow digits, max 6 characters
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtp(val);
                      }}
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      maxLength={6}
                      style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '22px', fontWeight: '700' }}
                    />
                  </div>

                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>
                </form>

                <div className="otp-actions">
                  <p className="otp-resend-text">
                    Didn't receive the code?{' '}
                    {resendCooldown > 0 ? (
                      <span className="otp-cooldown">Resend in {resendCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        className="otp-resend-btn"
                        onClick={handleResendOtp}
                        disabled={resendLoading}
                      >
                        {resendLoading ? 'Sending...' : 'Resend OTP'}
                      </button>
                    )}
                  </p>
                  <button
                    type="button"
                    className="otp-back-btn"
                    onClick={() => { setStep(1); setMessage(''); setOtp(''); }}
                  >
                    ← Back to Signup
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ============ STEP 3: Success ============ */}
          {step === 3 && (
            <div className="otp-verify-section">
              <div className="otp-icon-wrapper otp-success-icon">
                <CheckCircleIcon />
              </div>
              <div className="auth-form-header" style={{ textAlign: 'center' }}>
                <h3>Email Verified! 🎉</h3>
                <p>Your account has been verified successfully. Redirecting to login...</p>
              </div>
              <button className="auth-submit-btn" onClick={() => navigate('/login')}>
                Go to Login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Signup;