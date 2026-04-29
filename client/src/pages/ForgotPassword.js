import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import './Auth.css';

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

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP, 3 = Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [resetToken, setResetToken] = useState('');
  
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!email.trim()) {
      setIsError(true);
      setMessage('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message);
      setIsError(false);
      setStep(2);
      startResendCooldown();
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage(err.response?.data?.message || 'Failed to send OTP. Please try again.');
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
      const res = await API.post('/api/auth/verify-reset-otp', { email, otp: otp.trim() });
      setResetToken(res.data.resetToken);
      setMessage('OTP verified. Please enter your new password.');
      setIsError(false);
      setStep(3);
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (passwords.newPassword.length < 6) {
      setIsError(true);
      setMessage('Password must be at least 6 characters long.');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setIsError(true);
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await API.post('/api/auth/reset-password', { 
        resetToken, 
        newPassword: passwords.newPassword 
      });
      setMessage('Password reset! Redirecting...');
      setIsError(false);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setMessage('');
    setIsError(false);
    setResendLoading(true);
    try {
      const res = await API.post('/api/auth/forgot-password', { email });
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

  const maskEmail = (em) => {
    if (!em) return '';
    const parts = em.split('@');
    if (parts.length !== 2) return em;
    const [local, domain] = parts;
    if (local.length <= 3) return em;
    return `${local.slice(0, 3)}${'•'.repeat(local.length - 3)}@${domain}`;
  };

  return (
    <div className="auth-page">
      <div className="auth-master-container auth-master-container--centered">
        <div className="auth-form-panel">
          
          {/* STEP 1: Email Form */}
          {step === 1 && (
            <>
              <div className="auth-form-header">
                <h3>Reset Your Password</h3>
                <p>Enter your email to receive a reset OTP</p>
              </div>

              {message && (
                <div className={`auth-alert ${isError ? 'auth-alert-error' : 'auth-alert-success'}`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSendOtp} className="auth-form">
                <div className="input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>

              <p className="auth-redirect">
                <Link to="/login">← Back to Login</Link>
              </p>
            </>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 2 && (
            <div className="otp-verify-section">
              <div className="otp-icon-wrapper">
                <MailIcon />
              </div>
              <div className="auth-form-header" style={{ textAlign: 'center' }}>
                <h3>Check your email</h3>
                <p>OTP sent to</p>
                <p className="otp-email-display">{maskEmail(email)}</p>
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
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => {
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
                  {loading ? 'Verifying...' : 'Verify OTP'}
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
                  ← Back
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Reset Password */}
          {step === 3 && (
            <>
              <div className="auth-form-header">
                <h3>Set New Password</h3>
                <p>Please enter your new password below.</p>
              </div>

              {message && (
                <div className={`auth-alert ${isError ? 'auth-alert-error' : 'auth-alert-success'}`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="auth-form">
                <div className="input-group">
                  <label>New Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <EyeIcon show={showPassword} />
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    required
                  />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
