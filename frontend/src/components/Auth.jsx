import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Shield, Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        setLoading(false);
        return;
      }
    }

    try {
      let result;
      if (mode === 'signup') {
        result = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        });
      } else {
        result = await supabase.auth.signInWithPassword({ email, password });
      }

      const { data, error } = result;
      if (error) {
        setError(error.message);
      } else if (mode === 'signup') {
        setSuccess('✓ Account created! Check your email to confirm.');
      } else {
        setSuccess('✓ Successfully logged in!');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) setError(error.message);
  };

  const isSignup = mode === 'signup';

  return (
    <div className="login-page">
      {/* Decorative background glow */}
      <div className="login-glow"></div>

      <div className="login-card">
        {/* Header - Fixed to match legacy sizing */}
        <div className="login-card-header">
          <div className="login-logo">
            <Shield size={28} />
          </div>
          <h1 className="login-title">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="login-subtitle">
            {isSignup ? 'Join SkillProof and supercharge your job search' : 'Sign in to your SkillProof account'}
          </p>
        </div>

        {/* Mode toggle - Restore legacy pill UI */}
        <div className="login-mode-toggle">
          <button 
            className={`mode-btn ${!isSignup ? 'active' : ''}`} 
            onClick={() => setMode('signin')}
          >
            Sign In
          </button>
          <button 
            className={`mode-btn ${isSignup ? 'active' : ''}`} 
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleAuth}>
          {isSignup && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="John Doe" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required 
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-wrapper" style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-control" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button" 
                className="password-toggle" 
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isSignup && (
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
            </div>
          )}

          {error && <div className="error-msg active" style={{ marginBottom: '0.5rem' }}>{error}</div>}
          {success && <div className="auth-success-msg" style={{ marginBottom: '1rem', color: 'var(--success)', textAlign: 'center' }}>{success}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* Divider */}
        <div className="login-divider" style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
          <span style={{ padding: '0 1rem' }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
        </div>

        {/* Google OAuth */}
        <button 
          className="google-btn" 
          onClick={handleGoogleLogin}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-light)', background: 'transparent', color: 'white', cursor: 'pointer', fontSize: '0.9rem' }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.23 3.22l6.86-6.86C35.82 2.36 30.28 0 24 0 14.82 0 6.96 5.48 3.02 13.44l8 6.2C12.93 13.4 17.99 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-8-6.2C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.53 10.78l8-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.02 0-11.11-3.93-12.93-9.24l-8 6.19C6.96 42.62 14.82 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <p className="login-footnote" style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          By continuing you agree to SkillProof's <a href="#" style={{ color: 'var(--accent-primary)' }}>Terms</a> &amp; <a href="#" style={{ color: 'var(--accent-primary)' }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default Auth;
