import './Features.css';

const features = [
  {
    icon: '⚡',
    iconClass: 'icon-purple',
    glowClass: 'glow-purple',
    title: 'Smart Task Management',
    desc: 'Capture, organize, and prioritize every task with AI‑powered suggestions that learn from your habits over time.',
    large: true,
    preview: { label: 'Task completion rate', value: '87%', fill: '87%' },
  },
  {
    icon: '🎯',
    iconClass: 'icon-cyan',
    glowClass: 'glow-cyan',
    title: 'Deep Focus Mode',
    desc: 'Block distractions and enter your flow state with customizable Pomodoro timers and ambient sounds.',
    large: false,
  },
  {
    icon: '📊',
    iconClass: 'icon-pink',
    glowClass: 'glow-pink',
    title: 'Productivity Analytics',
    desc: 'Visual dashboards and weekly reports reveal your peak hours, progress trends, and growth areas.',
    large: false,
  },
  {
    icon: '🤖',
    iconClass: 'icon-green',
    glowClass: 'glow-green',
    title: 'AI Daily Planner',
    desc: 'Let AI auto‑schedule your tasks based on priority, deadlines, and your personal energy levels.',
    large: false,
  },
  {
    icon: '🔗',
    iconClass: 'icon-orange',
    glowClass: 'glow-orange',
    title: 'Seamless Integrations',
    desc: 'Connect with Notion, Slack, Google Calendar, GitHub, and 50+ apps you already use.',
    large: false,
  },
];

export default function Features() {
  return (
    <section className="features" id="features" aria-labelledby="features-title">
      <div className="container">
        <header className="features__header">
          <span className="section-label" aria-hidden="true">✦ Features</span>
          <h2 className="features__title" id="features-title">
            Everything you need to{' '}
            <span className="gradient-text">thrive</span>
          </h2>
          <p className="features__subtitle">
            Built for deep workers, creators, and anyone who refuses to let great ideas slip through the cracks.
          </p>
        </header>

        <div className="features__grid">
          {features.map((f, i) => (
            <article
              key={i}
              className={`feature-card ${f.large ? 'feature-card--large' : ''}`}
              id={`feature-card-${i}`}
            >
              <div className={`feature-card__glow ${f.glowClass}`} aria-hidden="true"></div>
              <div className={`feature-card__icon ${f.iconClass}`}>{f.icon}</div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>

              {f.preview && (
                <div className="feature-card__preview">
                  <div className="preview-label">
                    <span>{f.preview.label}</span>
                    <span>{f.preview.value}</span>
                  </div>
                  <div className="preview-bar">
                    <div
                      className="preview-bar__fill"
                      style={{ width: f.preview.fill }}
                      role="progressbar"
                      aria-valuenow={87}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
