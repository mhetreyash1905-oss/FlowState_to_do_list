import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled]         = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location    = useLocation();
  const navigate    = useNavigate();
  const { user, logout } = useAuth();

  const isApp = ['/dashboard', '/tracker'].includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const navClass = `navbar ${scrolled || isApp ? 'scrolled' : ''}`;

  return (
    <nav className={navClass} role="navigation" aria-label="Main Navigation">
      <div className="container navbar__inner">

        {/* Logo */}
        <NavLink to="/" className="navbar__logo" aria-label="FlowState Home" id="nav-logo">
          <span className="navbar__logo-icon">⚡</span>
          <span className="navbar__logo-text">FlowState</span>
        </NavLink>

        {/* Links — only show on homepage */}
        <ul className="navbar__links" role="list">
          {!isApp && (
            <>
              <li><a href="#features"     className="navbar__link" id="nav-link-features">Features</a></li>
              <li><a href="#how-it-works" className="navbar__link" id="nav-link-how">How It Works</a></li>
              <li><a href="#testimonials" className="navbar__link" id="nav-link-testimonials">Testimonials</a></li>
              <li><a href="#pricing"      className="navbar__link" id="nav-link-pricing">Pricing</a></li>
            </>
          )}
          {/* In-app navigation when logged in */}
          {user && isApp && (
            <>
              <li>
                <NavLink to="/dashboard" className={({isActive}) => `navbar__link ${isActive?'navbar__link--highlighted':''}`}
                  id="nav-app-dashboard">
                  🏠 Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/tracker" className={({isActive}) => `navbar__link ${isActive?'navbar__link--highlighted':''}`}
                  id="nav-app-tracker">
                  📅 Tracker
                </NavLink>
              </li>
            </>
          )}
        </ul>

        {/* Actions */}
        <div className="navbar__actions">
          {user ? (
            <div className="nav-avatar-wrap" ref={dropdownRef}>
              <button
                className="nav-avatar"
                id="nav-avatar-btn"
                aria-label="User menu"
                aria-expanded={dropdownOpen}
                onClick={() => setDropdownOpen(o => !o)}
              >
                <span className="nav-avatar__initials">{user.avatarInitials}</span>
                <span className="nav-avatar__chevron">{dropdownOpen ? '▲' : '▼'}</span>
              </button>

              {dropdownOpen && (
                <div className="nav-dropdown" role="menu" aria-label="User menu">
                  <div className="nav-dropdown__info">
                    <div className="nav-dropdown__avatar-lg">{user.avatarInitials}</div>
                    <div>
                      <div className="nav-dropdown__name">
                        {user.firstName}{user.lastName ? ` ${user.lastName}` : ''}
                      </div>
                      <div className="nav-dropdown__email">{user.email}</div>
                    </div>
                  </div>
                  <div className="nav-dropdown__divider" />
                  <NavLink to="/dashboard" className="nav-dropdown__item" id="dropdown-dashboard"
                    onClick={() => setDropdownOpen(false)} role="menuitem">
                    <span>🏠</span> My Dashboard
                  </NavLink>
                  <NavLink to="/tracker" className="nav-dropdown__item" id="dropdown-tracker"
                    onClick={() => setDropdownOpen(false)} role="menuitem">
                    <span>📅</span> Habit Tracker
                  </NavLink>
                  <button className="nav-dropdown__item nav-dropdown__item--muted" id="dropdown-settings"
                    role="menuitem" onClick={() => setDropdownOpen(false)}>
                    <span>⚙️</span> Settings
                  </button>
                  <div className="nav-dropdown__divider" />
                  <button className="nav-dropdown__item nav-dropdown__item--danger" id="dropdown-logout"
                    role="menuitem" onClick={handleLogout}>
                    <span>🚪</span> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <NavLink to="/login"    className="btn-ghost"   id="nav-login">Log in</NavLink>
              <NavLink to="/register" className="btn-primary" id="nav-signup"
                style={{ display:'inline-block', textAlign:'center' }}>
                Get Started Free
              </NavLink>
            </>
          )}
        </div>

        <button className="navbar__hamburger" aria-label="Toggle menu" id="nav-hamburger">
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
