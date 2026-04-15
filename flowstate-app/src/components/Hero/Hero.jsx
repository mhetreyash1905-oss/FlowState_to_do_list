import './Hero.css';

const tasks = [
  { id: 1, text: 'Design new dashboard UI', tag: 'Work', tagClass: 'tag-work', done: true },
  { id: 2, text: 'Morning workout – 30 min', tag: 'Health', tagClass: 'tag-health', done: true },
  { id: 3, text: 'Read: Atomic Habits ch.5', tag: 'Learn', tagClass: 'tag-learn', done: false },
  { id: 4, text: 'Redesign landing page', tag: 'Design', tagClass: 'tag-design', done: false },
];

const stats = [
  { value: '120K+', label: 'Active Users' },
  { value: '4.9★', label: 'App Store Rating' },
  { value: '98%', label: 'Satisfaction' },
];

export default function Hero() {
  return (
    <section className="hero" id="hero" aria-label="Hero section">
      {/* Animated background */}
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__grid"></div>
        <div className="hero__orb hero__orb--1"></div>
        <div className="hero__orb hero__orb--2"></div>
        <div className="hero__orb hero__orb--3"></div>
      </div>

      <div className="container">
        {/* Content */}
        <div className="hero__content">
          {/* <div className="hero__badge" id="hero-badge">
            <span className="hero__badge-dot"></span>
            Now in public beta · Join 120,000+ users
          </div> */}

          <h1 className="hero__title">
            Master your day.<br />
            <span className="highlight">Stay in flow.</span>
          </h1>

          <p className="hero__subtitle">
            FlowState combines smart task management, deep focus timers, and AI-powered insights
            to help you achieve more — without the burnout.
          </p>

          <div className="hero__actions">
            <button className="btn-hero-primary" id="hero-cta-primary">
              ✦ Start for Free
            </button>
            <button className="btn-hero-secondary" id="hero-cta-secondary">
              ▶ Watch demo
            </button>
          </div>

          {/* Stats */}
          {/* <div className="hero__stats" aria-label="Key statistics">
            {stats.map((s) => (
              <div key={s.label} className="hero__stat">
                <div className="hero__stat-value">{s.value}</div>
                <div className="hero__stat-label">{s.label}</div>
              </div>
            ))}
          </div> */}
        </div>

        {/* Dashboard visual */}
        <div className="hero__visual" aria-hidden="true">
          <div className="hero__dashboard">
            {/* Window chrome */}
            <div className="hero__dashboard-header">
              <span className="hero__dashboard-dot dot-red"></span>
              <span className="hero__dashboard-dot dot-yellow"></span>
              <span className="hero__dashboard-dot dot-green"></span>
              <span className="hero__dashboard-title">Today's Flow</span>
            </div>

            {/* Task list */}
            <ul className="hero__task-list" role="list">
              {tasks.map((task) => (
                <li key={task.id} className="hero__task">
                  <span className={`hero__task-check ${task.done ? 'done' : ''}`}>
                    {task.done ? '✓' : ''}
                  </span>
                  <span className={`hero__task-text ${task.done ? 'done' : ''}`}>{task.text}</span>
                  <span className={`hero__task-tag ${task.tagClass}`}>{task.tag}</span>
                </li>
              ))}
            </ul>

            {/* Progress ring widget */}
            <div className="hero__ring-widget">
              <svg className="ring-svg" viewBox="0 0 52 52" aria-label="Progress 76%">
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c5cfc" />
                    <stop offset="100%" stopColor="#00e5ff" />
                  </linearGradient>
                </defs>
                <circle className="ring-bg" cx="26" cy="26" r="20" />
                <circle className="ring-fill" cx="26" cy="26" r="20" />
              </svg>
              <div>
                <div className="ring-info-label">Daily Progress</div>
                <div className="ring-info-value">76%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
