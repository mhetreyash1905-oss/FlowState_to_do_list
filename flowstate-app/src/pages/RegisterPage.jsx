import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../components/Auth/Auth.css';

// ── Helpers ──────────────────────────────────────────────
function pwStrength(pw) {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return 'weak';
  if (score <= 2) return 'medium';
  return 'strong';
}

const STEPS = ['Account', 'Profile', 'Goals'];

const GOALS = [
  '🌅 Build daily habits',
  '📚 Learn consistently',
  '💪 Improve fitness',
  '💼 Boost productivity',
  '🧘 Reduce stress',
  '💡 Grow a side project',
  '📖 Read more books',
  '⚡ Achieve work-life balance',
];

const OCCUPATIONS = [
  'Student',
  'Software Engineer / Developer',
  'Designer / Creative',
  'Product Manager',
  'Marketing / Sales',
  'Entrepreneur / Founder',
  'Freelancer / Consultant',
  'Healthcare Professional',
  'Educator / Researcher',
  'Other',
];

const WORK_HOURS = ['< 4 hours', '4–6 hours', '6–8 hours', '8–10 hours', '10+ hours'];

// ── Brand panel ──────────────────────────────────────────
function AuthBrand({ step }) {
  const perks = [
    { icon: '🌅', label: 'Daily habit tracker with streaks' },
    { icon: '📅', label: 'Weekly & monthly goal tracking' },
    { icon: '🤖', label: 'AI-powered daily planner' },
    { icon: '📊', label: 'Progress analytics dashboard' },
  ];

  return (
    <aside className="auth-brand">
      <Link to="/" className="auth-brand__logo">
        <span className="auth-brand__logo-icon">⚡</span>
        <span className="auth-brand__logo-text">FlowState</span>
      </Link>

      <div className="auth-brand__hero">
        <h2 className="auth-brand__tagline">
          Start your<br />
          <span className="gradient-text">flow journey.</span>
        </h2>
        <p className="auth-brand__subtitle">
          Join 120,000+ achievers using FlowState to build better habits, focus deeper, and accomplish more every day.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {perks.map(p => (
            <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--clr-text-muted)' }}>
              <span style={{ fontSize: '1.1rem' }}>{p.icon}</span>
              {p.label}
            </div>
          ))}
        </div>
      </div>

      <div className="auth-brand__quote">
        <p className="auth-brand__quote-text">
          "I went from failing at every routine to completing 90% of my habits every single day. FlowState changed everything."
        </p>
        <div className="auth-brand__quote-author">
          <div className="auth-brand__quote-avatar">👨‍💻</div>
          <div>
            <div className="auth-brand__quote-name">James Carter</div>
            <div className="auth-brand__quote-role">Software Engineer @ Google</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Step indicator ────────────────────────────────────────
function StepIndicator({ current }) {
  return (
    <div className="auth-steps" aria-label="Registration steps">
      {STEPS.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : '';
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? '1' : '0' }}>
            <div className={`auth-step ${state}`}>
              <div className="auth-step__num">{i < current ? '✓' : i + 1}</div>
              <span>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="auth-step__connector" />}
          </div>
        );
      })}
    </div>
  );
}

// ── Register Page ─────────────────────────────────────────
export default function RegisterPage() {
  const navigate  = useNavigate();
  const { register } = useAuth();
  const [step, setStep]     = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const [form, setForm] = useState({
    // Step 0 — Account
    email: '', password: '', confirmPassword: '',
    // Step 1 — Profile
    firstName: '', lastName: '', occupation: '', dailyHours: '', timezone: '',
    // Step 2 — Goals
    goals: [], agreeTerms: false,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleGoal = (g) => {
    setForm(f => ({
      ...f,
      goals: f.goals.includes(g) ? f.goals.filter(x => x !== g) : [...f.goals, g],
    }));
  };

  const strength = pwStrength(form.password);

  // ── Validation per step ──
  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.email)              e.email    = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
      if (!form.password)           e.password = 'Password is required';
      else if (form.password.length < 8) e.password = 'At least 8 characters required';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    if (step === 1) {
      if (!form.firstName.trim())   e.firstName  = 'First name is required';
      if (!form.lastName.trim())    e.lastName   = 'Last name is required';
      if (!form.occupation)         e.occupation = 'Please select your occupation';
    }
    if (step === 2) {
      if (form.goals.length === 0)  e.goals     = 'Select at least one goal';
      if (!form.agreeTerms)         e.agreeTerms = 'You must agree to continue';
    }
    return e;
  };

  const next = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    if (step < 2) { setStep(s => s + 1); return; }
    // Final submit
    setLoading(true);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        occupation: form.occupation,
        goals: form.goals,
      });
      navigate('/dashboard');
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };
  const back = () => { setStep(s => s - 1); setErrors({}); };

  const strengthColors = { weak: 'filled-weak', medium: 'filled-medium', strong: 'filled-strong' };
  const strengthLabel  = { weak: ['weak', 'label-weak'], medium: ['medium', 'label-medium'], strong: ['strong 💪', 'label-strong'] };

  return (
    <div className="auth-page">
      <div className="auth-page__grid" aria-hidden="true" />
      <div className="auth-page__orb auth-page__orb--1" aria-hidden="true" />
      <div className="auth-page__orb auth-page__orb--2" aria-hidden="true" />
      <div className="auth-page__orb auth-page__orb--3" aria-hidden="true" />

      <AuthBrand step={step} />

      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card__header">
            <h1 className="auth-card__title">
              {step === 0 && <>Create your <span className="gradient-text">account</span></>}
              {step === 1 && <>Tell us about <span className="gradient-text">yourself</span></>}
              {step === 2 && <>Set your <span className="gradient-text">goals</span></>}
            </h1>
            <p className="auth-card__subtitle">
              Already have an account?{' '}
              <Link to="/login" id="register-to-login">Sign in →</Link>
            </p>
          </div>

          <StepIndicator current={step} />

          <form className="auth-form" onSubmit={next} noValidate id="register-form">

            {/* ── STEP 0: Account ── */}
            {step === 0 && (
              <>
                {/* Social */}
                <div className="auth-socials">
                  <button type="button" className="auth-social-btn" id="reg-google">🔵 Google</button>
                  <button type="button" className="auth-social-btn" id="reg-github">⬛ GitHub</button>
                </div>
                <div className="auth-divider">or register with email</div>

                {/* Email */}
                <div className="field">
                  <label className="field__label" htmlFor="reg-email">Email address <span>*</span></label>
                  <div className="field__input-wrap">
                    <span className="field__icon">✉️</span>
                    <input id="reg-email" className={`field__input ${errors.email ? 'error' : ''}`}
                      type="email" autoComplete="email" placeholder="you@example.com"
                      value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  {errors.email && <span className="field__error">⚠ {errors.email}</span>}
                </div>

                {/* Password */}
                <div className="field">
                  <label className="field__label" htmlFor="reg-password">Password <span>*</span></label>
                  <div className="field__input-wrap">
                    <span className="field__icon">🔒</span>
                    <input id="reg-password" className={`field__input field__input--pw ${errors.password ? 'error' : ''}`}
                      type={showPw ? 'text' : 'password'} autoComplete="new-password" placeholder="Min. 8 characters"
                      value={form.password} onChange={e => set('password', e.target.value)} />
                    <button type="button" className="field__pw-toggle" onClick={() => setShowPw(s => !s)}
                      aria-label={showPw ? 'Hide' : 'Show'}>
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.password && <span className="field__error">⚠ {errors.password}</span>}
                  {/* Strength meter */}
                  {form.password && (
                    <div className="pw-strength">
                      <div className="pw-strength__bars">
                        {[0, 1, 2, 3].map(i => {
                          const filled = i < (['weak',1,'medium',2,'strong',4].indexOf(strength) < 0
                            ? 0 : strength === 'weak' ? 1 : strength === 'medium' ? 2 : 4);
                          return (
                            <div key={i} className={`pw-strength__bar ${
                              strength && i < (strength === 'weak' ? 1 : strength === 'medium' ? 2 : 4)
                                ? strengthColors[strength] : ''
                            }`} />
                          );
                        })}
                      </div>
                      {strength && (
                        <span className={`pw-strength__label ${strengthLabel[strength][1]}`}>
                          Password strength: {strengthLabel[strength][0]}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="field">
                  <label className="field__label" htmlFor="reg-cpw">Confirm password <span>*</span></label>
                  <div className="field__input-wrap">
                    <span className="field__icon">🔑</span>
                    <input id="reg-cpw" className={`field__input field__input--pw ${errors.confirmPassword ? 'error' : ''}`}
                      type={showCpw ? 'text' : 'password'} autoComplete="new-password" placeholder="Re-enter password"
                      value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                    <button type="button" className="field__pw-toggle" onClick={() => setShowCpw(s => !s)}
                      aria-label={showCpw ? 'Hide' : 'Show'}>
                      {showCpw ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="field__error">⚠ {errors.confirmPassword}</span>}
                </div>
              </>
            )}

            {/* ── STEP 1: Profile ── */}
            {step === 1 && (
              <>
                {/* First + Last name */}
                <div className="auth-form__row">
                  <div className="field">
                    <label className="field__label" htmlFor="reg-fname">First name <span>*</span></label>
                    <div className="field__input-wrap">
                      <span className="field__icon">👤</span>
                      <input id="reg-fname" className={`field__input ${errors.firstName ? 'error' : ''}`}
                        type="text" autoComplete="given-name" placeholder="Alice"
                        value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                    </div>
                    {errors.firstName && <span className="field__error">⚠ {errors.firstName}</span>}
                  </div>
                  <div className="field">
                    <label className="field__label" htmlFor="reg-lname">Last name <span>*</span></label>
                    <div className="field__input-wrap">
                      <span className="field__icon">👤</span>
                      <input id="reg-lname" className={`field__input ${errors.lastName ? 'error' : ''}`}
                        type="text" autoComplete="family-name" placeholder="Smith"
                        value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                    </div>
                    {errors.lastName && <span className="field__error">⚠ {errors.lastName}</span>}
                  </div>
                </div>

                {/* Occupation */}
                <div className="field">
                  <label className="field__label" htmlFor="reg-occupation">Occupation <span>*</span></label>
                  <div className="field__input-wrap">
                    <span className="field__icon">💼</span>
                    <select id="reg-occupation" className={`field__select ${errors.occupation ? 'error' : ''}`}
                      value={form.occupation} onChange={e => set('occupation', e.target.value)}>
                      <option value="">Select your occupation…</option>
                      {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <span className="field__select-arrow">▾</span>
                  </div>
                  {errors.occupation && <span className="field__error">⚠ {errors.occupation}</span>}
                </div>

                {/* Daily work hours */}
                <div className="field">
                  <label className="field__label" htmlFor="reg-hours">
                    How many hours do you work/study daily?
                  </label>
                  <div className="field__input-wrap">
                    <span className="field__icon">⏱️</span>
                    <select id="reg-hours" className="field__select"
                      value={form.dailyHours} onChange={e => set('dailyHours', e.target.value)}>
                      <option value="">Select range…</option>
                      {WORK_HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="field__select-arrow">▾</span>
                  </div>
                </div>

                {/* Timezone */}
                <div className="field">
                  <label className="field__label" htmlFor="reg-timezone">Your timezone</label>
                  <div className="field__input-wrap">
                    <span className="field__icon">🌍</span>
                    <input id="reg-timezone" className="field__input" type="text"
                      placeholder="e.g. Asia/Kolkata, America/New_York"
                      value={form.timezone} onChange={e => set('timezone', e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 2: Goals ── */}
            {step === 2 && (
              <>
                <div className="field">
                  <label className="field__label">
                    What are your main goals? <span>*</span>
                    <span style={{ color: 'var(--clr-text-dim)', fontWeight: 400, marginLeft: '0.4rem'}}>
                      (pick all that apply)
                    </span>
                  </label>
                  <div className="goal-chips">
                    {GOALS.map(g => (
                      <button
                        key={g} type="button"
                        className={`goal-chip ${form.goals.includes(g) ? 'selected' : ''}`}
                        onClick={() => toggleGoal(g)}
                        id={`goal-${g.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  {errors.goals && <span className="field__error">⚠ {errors.goals}</span>}
                </div>

                {/* Referral */}
                <div className="field">
                  <label className="field__label" htmlFor="reg-referral">
                    How did you hear about FlowState?
                  </label>
                  <div className="field__input-wrap">
                    <span className="field__icon">📣</span>
                    <select id="reg-referral" className="field__select"
                      value={form.referral || ''} onChange={e => set('referral', e.target.value)}>
                      <option value="">Select…</option>
                      {['Social media','Friend / colleague','Search engine','Blog / article','YouTube','App store','Other']
                        .map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <span className="field__select-arrow">▾</span>
                  </div>
                </div>

                {/* T&C */}
                <label className="auth-check-row" htmlFor="reg-terms">
                  <input id="reg-terms" type="checkbox"
                    checked={form.agreeTerms} onChange={e => set('agreeTerms', e.target.checked)} />
                  I agree to the{' '}
                  <Link to="/terms">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy">Privacy Policy</Link>
                </label>
                {errors.agreeTerms && <span className="field__error">⚠ {errors.agreeTerms}</span>}
              </>
            )}

            {/* ── Navigation buttons ── */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              {step > 0 && (
                <button type="button" onClick={back} id="reg-back"
                  style={{ flex: '0 0 auto', fontFamily: 'var(--font-body)', fontSize: '0.9rem',
                    fontWeight: 600, color: 'var(--clr-text-muted)', padding: '0.9rem 1.4rem',
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--clr-border)',
                    background: 'transparent', cursor: 'pointer', transition: 'var(--transition)' }}>
                  ← Back
                </button>
              )}
              <button className="auth-submit" type="submit" id="reg-next" disabled={loading}>
                {loading
                  ? '⏳ Creating account…'
                  : step < 2
                    ? 'Continue →'
                    : '🚀 Create My Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
