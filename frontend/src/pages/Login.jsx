import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/hotels';
  const customMessage = location.state?.message || '';

  const [formData, setFormData] = useState({
    email: localStorage.getItem('staywise_remembered_email') || '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(
    !!localStorage.getItem('staywise_remembered_email')
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (rememberMe) {
        localStorage.setItem('staywise_remembered_email', formData.email.trim());
      } else {
        localStorage.removeItem('staywise_remembered_email');
      }

      await login(formData.email.trim(), formData.password);
      navigate(from, { replace: true, state: location.state?.preserveState });
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Quick Evaluation Login
  const handleQuickLogin = async (quickEmail, quickPassword) => {
    setFormData({ email: quickEmail, password: quickPassword });
    setError('');
    setLoading(true);
    try {
      await login(quickEmail, quickPassword);
      navigate(from, { replace: true, state: location.state?.preserveState });
    } catch (err) {
      setError(err.message || 'Quick login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setForgotModalOpen(false);
      setForgotEmail('');
    }, 3000);
  };

  return (
    <div
      className="auth-page-wrapper"
      style={{
        padding: '4rem 1.5rem',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, var(--bg-page) 0%, #f4f2ee 100%)'
      }}
    >
      <div
        className="auth-card"
        style={{
          maxWidth: '440px',
          width: '100%',
          background: 'var(--bg-card)',
          padding: '2.75rem 2.5rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--border-strong)'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--primary)',
              color: 'var(--accent-gold)',
              fontSize: '1.4rem',
              marginBottom: '1rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            🏛️
          </div>
          <span
            style={{
              fontSize: '0.78rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--accent-gold)',
              fontWeight: 700,
              display: 'block'
            }}
          >
            Member Access
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2rem',
              marginTop: '0.35rem',
              color: 'var(--text-main)',
              letterSpacing: '-0.02em'
            }}
          >
            Sign In to StayWise
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Access your reservations, curated wishlists & member privileges.
          </p>
        </div>

        {/* Redirect Notice (e.g. from booking page) */}
        {customMessage && (
          <div
            style={{
              background: 'var(--accent-gold-light)',
              borderLeft: '4px solid var(--accent-gold)',
              color: '#92400e',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-xs)',
              marginBottom: '1.5rem',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>ℹ️</span>
            <span>{customMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: 'var(--accent-rose-light)',
              borderLeft: '4px solid var(--accent-rose)',
              color: 'var(--accent-rose)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-xs)',
              marginBottom: '1.5rem',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Evaluation / Role Quick Access */}
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'var(--bg-subtle, #f9f8f6)',
            borderRadius: 'var(--radius-sm, 8px)',
            border: '1px solid var(--border, #e5e5e5)',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--accent-gold, #c5a059)',
              marginBottom: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <span>⚡</span>
            <span>Demo Sign In</span>
          </div>
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-secondary, #52525b)',
              marginBottom: '0.65rem',
              lineHeight: 1.35
            }}
          >
            Click any demo role below to sign in instantly with 1 click:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('guest@staywise.com', 'Guest@123456')}
              title="Sign in instantly as Demo Guest"
              style={{
                padding: '0.6rem 0.25rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-xs, 4px)',
                border: '1px solid var(--border-strong, #d4d4d8)',
                background: '#ffffff',
                color: 'var(--text-main, #18181b)',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; e.currentTarget.style.background = '#faf9f5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong, #d4d4d8)'; e.currentTarget.style.background = '#ffffff'; }}
            >
              <span style={{ fontSize: '1.1rem' }}>👤</span>
              <span>Demo Guest</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('manager@staywise.com', 'Manager@123456')}
              title="Sign in instantly as Demo Manager"
              style={{
                padding: '0.6rem 0.25rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-xs, 4px)',
                border: '1px solid var(--border-strong, #d4d4d8)',
                background: '#ffffff',
                color: 'var(--text-main, #18181b)',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; e.currentTarget.style.background = '#faf9f5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong, #d4d4d8)'; e.currentTarget.style.background = '#ffffff'; }}
            >
              <span style={{ fontSize: '1.1rem' }}>🏨</span>
              <span>Demo Manager</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('admin@staywise.com', 'Admin@123456')}
              title="Sign in instantly as Demo Admin"
              style={{
                padding: '0.6rem 0.25rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-xs, 4px)',
                border: '1px solid var(--border-strong, #d4d4d8)',
                background: '#ffffff',
                color: 'var(--text-main, #18181b)',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; e.currentTarget.style.background = '#faf9f5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong, #d4d4d8)'; e.currentTarget.style.background = '#ffffff'; }}
            >
              <span style={{ fontSize: '1.1rem' }}>🛡️</span>
              <span>Demo Admin</span>
            </button>
          </div>
        </div>

        {/* Divider with "OR SIGN IN MANUALLY" */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '0 0 1.25rem',
            color: 'var(--text-muted, #71717a)',
            fontSize: '0.72rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--border, #e4e4e7)' }} />
          <span style={{ padding: '0 0.75rem', fontWeight: 600 }}>or sign in manually</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border, #e4e4e7)' }} />
        </div>

        {/* Real Sign In Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label
              htmlFor="signin-email"
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '0.35rem'
              }}
            >
              Email Address
            </label>
            <input
              id="signin-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. traveler@example.com"
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-strong)',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'var(--transition-fast)'
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label
                htmlFor="signin-password"
                style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-blue)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Forgot password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="signin-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '0.8rem 2.8rem 0.8rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-strong)',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: '4px'
                }}
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '-0.25rem' }}>
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
            />
            <label htmlFor="remember-me" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Remember my email on this device
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.9rem',
              marginTop: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? (
              <>
                <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span>Authenticating...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Join / Create Account CTA */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border)',
            fontSize: '0.92rem',
            color: 'var(--text-secondary)'
          }}
        >
          Testing registration or new to StayWise?{' '}
          <Link
            to="/register"
            state={location.state}
            style={{ color: 'var(--accent-gold)', fontWeight: 700, textDecoration: 'none' }}
          >
            Create an Account / Demo Sign Up →
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '1rem'
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '440px',
              width: '100%',
              background: '#fff',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              boxShadow: 'var(--shadow-floating)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem' }}>Reset Password</h3>
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Enter the email address registered with your StayWise account. We will dispatch secure password recovery instructions.
            </p>

            {forgotSent ? (
              <div
                style={{
                  background: 'var(--emerald-light)',
                  color: 'var(--emerald)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.88rem',
                  borderLeft: '4px solid var(--emerald)'
                }}
              >
                ✓ Recovery instructions dispatched. Please check your inbox.
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. traveler@example.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-strong)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="btn btn-outline"
                    style={{ padding: '0.55rem 1rem' }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.55rem 1.25rem' }}>
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
