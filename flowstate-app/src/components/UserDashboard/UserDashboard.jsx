import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getActivityLog, getHeatmapData } from '../../utils/activityLog';
import './UserDashboard.css';

// ─── helpers ─────────────────────────────────────────────
function loadLS(key, fb) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; }
  catch { return fb; }
}
function saveLS(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }

const OCCUPATIONS = [
  'Student','Software Engineer / Developer','Designer / Creative',
  'Product Manager','Marketing / Sales','Entrepreneur / Founder',
  'Freelancer / Consultant','Healthcare Professional','Educator / Researcher','Other',
];

function levelClass(v) {
  if (v === 0) return '';
  if (v <= 2)  return 'l1';
  if (v <= 4)  return 'l2';
  if (v <= 6)  return 'l3';
  return 'l4';
}

const ACTION_META = {
  completed: { emoji: '✅', verb: 'Completed',  status: 'done'  },
  unchecked: { emoji: '↩️', verb: 'Unchecked',   status: 'miss'  },
  added:     { emoji: '➕', verb: 'Added',       status: 'done'  },
  deleted:   { emoji: '🗑️', verb: 'Deleted',     status: 'miss'  },
  plus:      { emoji: '👍', verb: '+1 on',       status: 'done'  },
  minus:     { emoji: '👎', verb: '-1 on',       status: 'miss'  },
};

function formatTime(isoStr) {
  const d = new Date(isoStr);
  const now = new Date();
  const diffMs = now - d;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7)  return `${days} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const CATEGORY_COLORS = {
  daily:   '#7c5cfc',
  weekly:  '#00e5ff',
  monthly: '#00ffb3',
  habit:   '#ff6f91',
  todo:    '#ffd740',
};

// ─── Component ────────────────────────────────────────────
export default function UserDashboard() {
  const { user, login } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh data every 10 seconds so it stays live
  useEffect(() => {
    const iv = setInterval(() => setRefreshKey(k => k + 1), 10000);
    return () => clearInterval(iv);
  }, []);

  // Pull tracker data for live stats
  const habits  = loadLS('fs_habits2',  []);
  const daily   = loadLS('fs_daily3',   []);
  const weekly  = loadLS('fs_weekly3',  []);
  const monthly = loadLS('fs_monthly3', []);
  const todos   = loadLS('fs_todos2',   []);

  const dailyDone   = daily.filter(d => d.completed).length;
  const dailyTotal  = daily.length;
  const weeklyDone  = weekly.filter(d => d.completed).length;
  const weeklyTotal = weekly.length;
  const monthlyDone = monthly.filter(d => d.completed).length;
  const monthlyTotal = monthly.length;
  const todoDone    = todos.filter(t => t.done).length;
  const todoTotal   = todos.length;
  const todoPending = todoTotal - todoDone;
  const habitScore  = habits.reduce((acc, h) => acc + h.score, 0);
  const longestStreak = daily.length ? Math.max(...daily.map(d => d.streak || 0), 0) : 0;

  const dailyPct   = dailyTotal  ? Math.round((dailyDone / dailyTotal) * 100)   : 0;
  const weeklyPct  = weeklyTotal ? Math.round((weeklyDone / weeklyTotal) * 100) : 0;
  const monthlyPct = monthlyTotal? Math.round((monthlyDone / monthlyTotal) * 100): 0;
  const todoPct    = todoTotal   ? Math.round((todoDone / todoTotal) * 100)     : 0;
  const habitPct   = habits.length ? Math.min(100, Math.max(0, Math.round(((habitScore + habits.length * 3) / (habits.length * 6)) * 100))) : 0;

  // Profile
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(() => loadLS('fs_profile', {
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    email: user?.email || '', occupation: user?.occupation || '',
    timezone: '', bio: '', goals: [],
  }));
  useEffect(() => saveLS('fs_profile', profile), [profile]);
  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const saveProfile = () => {
    login({ ...user, firstName: profile.firstName, lastName: profile.lastName, occupation: profile.occupation });
    setEditing(false);
  };

  const initials = profile.firstName && profile.lastName
    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    : profile.firstName ? profile.firstName[0].toUpperCase()
    : profile.email?.[0]?.toUpperCase() || 'U';

  const hour = new Date().getHours();
  const greet = hour < 12 ? '☀️ Good morning' : hour < 17 ? '⚡ Good afternoon' : '🌙 Good evening';
  const formattedDate = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'FlowState User';

  // Real activity data
  const activityLog   = getActivityLog(15);
  const heatmapData   = getHeatmapData(91);
  const totalActivity = heatmapData.reduce((a, c) => a + c.count, 0);

  return (
    <div className="udash">
      <div className="container-wide">

        {/* Welcome bar */}
        <div className="udash__welcome">
          <div className="udash__hello">
            <span className="gradient-text">{greet}, {profile.firstName || 'there'} 👋</span>
            <span>Here's your personal overview for today.</span>
          </div>
          <div className="udash__date-pill">📅 {formattedDate}</div>
        </div>

        {/* ── Stats row ── */}
        <div className="udash__stats">
          <div className="stat-card stat-card--purple" id="stat-daily">
            <div className="stat-card__icon">🌅</div>
            <div className="stat-card__value">
              {dailyDone}<span style={{fontSize:'1rem',fontWeight:500,color:'var(--clr-text-muted)'}}>/{dailyTotal}</span>
            </div>
            <div className="stat-card__label">Dailies Done</div>
            <div className="stat-card__sub">Today's habits completed</div>
          </div>

          <div className="stat-card stat-card--cyan" id="stat-streak">
            <div className="stat-card__icon">🔥</div>
            <div className="stat-card__value">{longestStreak}</div>
            <div className="stat-card__label">Best Streak</div>
            <div className="stat-card__sub">Consecutive completions</div>
          </div>

          <div className="stat-card stat-card--green" id="stat-todo">
            <div className="stat-card__icon">📋</div>
            <div className="stat-card__value">{todoPending}</div>
            <div className="stat-card__label">Tasks Pending</div>
            <div className="stat-card__sub">{todoDone} completed total</div>
          </div>

          <div className="stat-card stat-card--pink" id="stat-habit">
            <div className="stat-card__icon">⚡</div>
            <div className="stat-card__value">{habitScore >= 0 ? `+${habitScore}` : habitScore}</div>
            <div className="stat-card__label">Habit Score</div>
            <div className="stat-card__sub">{habits.length} habits tracked</div>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="udash__main">

          {/* ── Left: Profile card ── */}
          <aside>
            <div className="udash__profile-card" id="profile-card">
              <div className="profile-card__cover">
                <button className="profile-card__cover-edit" onClick={() => setEditing(e => !e)}>
                  {editing ? '✕ Cancel' : '✏️ Edit'}
                </button>
              </div>
              <div className="profile-card__avatar-row">
                <div className="profile-card__avatar">{initials}</div>
                <button className="profile-card__edit-btn" onClick={() => setEditing(e => !e)} id="profile-edit-toggle">
                  {editing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
              <div className="profile-card__info">
                <div className="profile-card__name">{fullName}</div>
                <div className="profile-card__occupation">{profile.occupation || 'No occupation set'}</div>
                <div className="profile-card__meta">
                  <div className="profile-card__meta-row">📧 <em>{profile.email || '—'}</em></div>
                  {profile.timezone && <div className="profile-card__meta-row">🌍 <em>{profile.timezone}</em></div>}
                  {profile.bio && <div className="profile-card__meta-row" style={{alignItems:'flex-start'}}>💬 <em style={{whiteSpace:'pre-wrap'}}>{profile.bio}</em></div>}
                </div>
              </div>

              {editing && (
                <div className="profile-edit-form" id="profile-edit-form">
                  <div className="edit-field">
                    <label htmlFor="pf-fname">First Name</label>
                    <input id="pf-fname" type="text" value={profile.firstName}
                      onChange={e => set('firstName', e.target.value)} placeholder="First name" />
                  </div>
                  <div className="edit-field">
                    <label htmlFor="pf-lname">Last Name</label>
                    <input id="pf-lname" type="text" value={profile.lastName}
                      onChange={e => set('lastName', e.target.value)} placeholder="Last name" />
                  </div>
                  <div className="edit-field">
                    <label htmlFor="pf-email">Email</label>
                    <input id="pf-email" type="email" value={profile.email}
                      onChange={e => set('email', e.target.value)} placeholder="Email" />
                  </div>
                  <div className="edit-field">
                    <label htmlFor="pf-occ">Occupation</label>
                    <select id="pf-occ" value={profile.occupation}
                      onChange={e => set('occupation', e.target.value)}>
                      <option value="">Select…</option>
                      {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="edit-field">
                    <label htmlFor="pf-tz">Timezone</label>
                    <input id="pf-tz" type="text" value={profile.timezone}
                      onChange={e => set('timezone', e.target.value)} placeholder="e.g. Asia/Kolkata" />
                  </div>
                  <div className="edit-field">
                    <label htmlFor="pf-bio">Bio</label>
                    <input id="pf-bio" type="text" value={profile.bio}
                      onChange={e => set('bio', e.target.value)} placeholder="Short bio…" />
                  </div>
                  <button className="edit-save-btn" onClick={saveProfile} id="profile-save">💾 Save Changes</button>
                </div>
              )}

              <nav className="profile-card__nav" aria-label="Quick navigation">
                <NavLink to="/dashboard" className={({isActive}) => `profile-nav-link ${isActive?'active':''}`} id="qnav-dashboard">
                  <span>🏠</span> My Dashboard
                </NavLink>
                <NavLink to="/tracker" className={({isActive}) => `profile-nav-link ${isActive?'active':''}`} id="qnav-tracker">
                  <span>📅</span> Habit Tracker
                </NavLink>
                <button className="profile-nav-link" id="qnav-settings" onClick={() => setEditing(true)}>
                  <span>⚙️</span> Edit Profile
                </button>
              </nav>
            </div>
          </aside>

          {/* ── Right: Progress + Activity + Recent ── */}
          <div className="udash__right">

            {/* Progress card — LIVE data */}
            <div className="progress-card" id="progress-card">
              <div className="progress-card__title">📊 Today's Progress</div>

              <div className="progress-row">
                <div className="progress-row__label">Daily Habits</div>
                <div className="progress-row__bar">
                  <div className="progress-row__fill fill-p" style={{ width: `${dailyPct}%` }} />
                </div>
                <div className="progress-row__pct">{dailyPct}%</div>
              </div>

              <div className="progress-row">
                <div className="progress-row__label">Weekly Goals</div>
                <div className="progress-row__bar">
                  <div className="progress-row__fill fill-c" style={{ width: `${weeklyPct}%` }} />
                </div>
                <div className="progress-row__pct">{weeklyPct}%</div>
              </div>

              <div className="progress-row">
                <div className="progress-row__label">Monthly Goals</div>
                <div className="progress-row__bar">
                  <div className="progress-row__fill fill-g" style={{ width: `${monthlyPct}%` }} />
                </div>
                <div className="progress-row__pct">{monthlyPct}%</div>
              </div>

              <div className="progress-row">
                <div className="progress-row__label">To-Do List</div>
                <div className="progress-row__bar">
                  <div className="progress-row__fill fill-pk" style={{ width: `${todoPct}%` }} />
                </div>
                <div className="progress-row__pct">{todoPct}%</div>
              </div>

              <div className="progress-row">
                <div className="progress-row__label">Habit Score</div>
                <div className="progress-row__bar">
                  <div className="progress-row__fill fill-p" style={{ width: `${Math.max(5, habitPct)}%` }} />
                </div>
                <div className="progress-row__pct">{habitPct}%</div>
              </div>
            </div>

            {/* Activity heatmap — REAL data from activity log */}
            <div className="activity-card" id="activity-card">
              <div className="activity-card__title">
                📈 Activity — Last 13 Weeks
                <span style={{marginLeft:'auto', fontSize:'0.78rem', fontWeight:600, color:'var(--clr-text-muted)', fontFamily:'var(--font-body)'}}>
                  {totalActivity} total actions
                </span>
              </div>
              <div className="activity-grid" aria-label="Activity heatmap">
                {heatmapData.map((cell, i) => (
                  <div key={i} className={`activity-cell ${levelClass(cell.count)}`}
                    title={`${cell.date}: ${cell.count} action${cell.count!==1?'s':''}`} />
                ))}
              </div>
              <div className="activity-legend">
                <span>Less</span>
                {[0,1,2,3,4].map(l => (
                  <div key={l} className={`activity-legend__cell ${levelClass(l === 0 ? 0 : l * 2)}`}
                    style={l === 0 ? { background: 'var(--clr-surface-2)' } : undefined} />
                ))}
                <span>More</span>
              </div>
            </div>

            {/* Recent activity — REAL from activity log */}
            <div className="recent-card" id="recent-card">
              <div className="recent-card__head">
                <div className="recent-card__title">🕐 Recent Activity</div>
                <NavLink to="/tracker" className="recent-card__link" id="recent-go-tracker">
                  Open Tracker →
                </NavLink>
              </div>
              {activityLog.length === 0 && (
                <div style={{padding:'2rem 1.4rem', textAlign:'center', color:'var(--clr-text-dim)', fontSize:'0.85rem'}}>
                  No activity yet — start checking off tasks in the{' '}
                  <NavLink to="/tracker" style={{color:'var(--clr-primary-2)', fontWeight:600}}>Tracker</NavLink>!
                </div>
              )}
              {activityLog.map((item, i) => {
                const meta = ACTION_META[item.action] || { emoji:'📌', verb:'Action on', status:'due' };
                return (
                  <div key={item.id || i} className="recent-item" id={`recent-item-${i}`}>
                    <div className="recent-item__dot" style={{ background: CATEGORY_COLORS[item.category] || '#7c5cfc' }} />
                    <div className="recent-item__text">
                      {meta.verb} "<strong>{item.title}</strong>"
                    </div>
                    <div className="recent-item__cat">{item.category}</div>
                    <div className="recent-item__time">{formatTime(item.timestamp)}</div>
                    <div className={`recent-item__status status-${meta.status}`}>
                      {meta.status === 'done' ? '✓ Done' : meta.status === 'due' ? '◷ Due' : '✗ Change'}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
