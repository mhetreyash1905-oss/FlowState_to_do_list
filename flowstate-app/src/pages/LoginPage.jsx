import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../components/Auth/Auth.css';

function AuthBrand() {
  return (
    <aside className="auth-brand">
      <Link to="/" className="auth-brand__logo">
        <span className="auth-brand__logo-icon">⚡</span>
        <span className="auth-brand__logo-text">FlowState</span>
      </Link>
      <div className="auth-brand__hero">
        <h2 className="auth-brand__tagline">
          Welcome back.<br />
          <span className="gradient-text">Your flow awaits.</span>
        </h2>
        <p className="auth-brand__subtitle">
          Pick up right where you left off. Your habits, tasks, and progress are waiting for you.
        </p>
        <div className="auth-brand__chips">
          {['🔁 Daily Streaks', '📅 Weekly Goals', '📊 Analytics', '🤖 AI Planner'].map(c => (
            <span key={c} className="auth-chip">{c}</span>
          ))}
        </div>
      </div>
      <div className="auth-brand__quote">
        <p className="auth-brand__quote-text">
          "FlowState helped me build a morning routine that actually sticks. I feel completely transformed."
        </p>
        <div className="auth-brand__quote-author">
          <div className="auth-brand__quote-avatar">👩‍💻</div>
          <div>
            <div className="auth-brand__quote-name">Priya Mehta</div>
            <div className="auth-brand__quote-role">Product Designer @ Stripe</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm]     = useState({ email: '', password: '', remember: false });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setTimeout(() => {
      // Extract name from email as fallback
      const namePart = form.email.split('@')[0];
      login({ email: form.email, firstName: namePart, lastName: '' });
      setLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="auth-page">
      <div className="auth-page__grid" aria-hidden="true" />
      <div className="auth-page__orb auth-page__orb--1" aria-hidden="true" />
      <div className="auth-page__orb auth-page__orb--2" aria-hidden="true" />
      <AuthBrand />
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card__header">
            <h1 className="auth-card__title">
              Sign in to <span className="gradient-text">FlowState</span>
            </h1>
            <p className="auth-card__subtitle">
              No account yet? <Link to="/register" id="login-to-register">Create one free →</Link>
            </p>
          </div>

          <div className="auth-socials" style={{ marginBottom: '1.25rem' }}>
            <button className="auth-social-btn" id="login-google" type="button">🔵 Google</button>
            <button className="auth-social-btn" id="login-github" type="button">⬛ GitHub</button>
          </div>
          <div className="auth-divider">or sign in with email</div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate id="login-form">
            <div className="field">
              <label className="field__label" htmlFor="login-email">Email address <span>*</span></label>
              <div className="field__input-wrap">
                <span className="field__icon">✉️</span>
                <input id="login-email" className={`field__input ${errors.email ? 'error' : ''}`}
                  type="email" autoComplete="email" placeholder="you@example.com"
                  value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              {errors.email && <span className="field__error">⚠ {errors.email}</span>}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="login-password">Password <span>*</span></label>
              <div className="field__input-wrap">
                <span className="field__icon">🔒</span>
                <input id="login-password"
                  className={`field__input field__input--pw ${errors.password ? 'error' : ''}`}
                  type={showPw ? 'text' : 'password'} autoComplete="current-password"
                  placeholder="••••••••••" value={form.password}
                  onChange={e => set('password', e.target.value)} />
                <button type="button" className="field__pw-toggle"
                  onClick={() => setShowPw(s => !s)} aria-label="Toggle password">
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span className="field__error">⚠ {errors.password}</span>}
            </div>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem' }}>
              <label className="auth-check-row" htmlFor="login-remember">
                <input id="login-remember" type="checkbox"
                  checked={form.remember} onChange={e => set('remember', e.target.checked)} />
                Remember me for 30 days
              </label>
              <div className="auth-forgot"><Link to="#">Forgot password?</Link></div>
            </div>

            <button className="auth-submit" type="submit" id="login-submit" disabled={loading}>
              {loading ? '⏳ Signing in…' : '→ Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
