import './Testimonials.css';

const testimonials = [
  {
    stars: '★★★★★',
    text: 'FlowState completely changed how I approach my day. I get 3× more done and actually feel good doing it.',
    name: 'Priya Mehta',
    role: 'Product Designer @ Stripe',
    avatar: '👩‍💻',
    avatarBg: 'rgba(124,92,252,0.2)',
  },
  {
    stars: '★★★★★',
    text: 'The AI planner is genuinely magical. It figured out I work best between 9–11 AM within a week.',
    name: 'James Carter',
    role: 'Software Engineer @ Google',
    avatar: '👨‍💻',
    avatarBg: 'rgba(0,229,255,0.15)',
  },
  {
    stars: '★★★★★',
    text: 'Best productivity app I\'ve ever used. I cancelled 4 other subscriptions because FlowState does it all.',
    name: 'Aisha Okafor',
    role: 'Founder & CEO @ Launchpad',
    avatar: '👩‍🚀',
    avatarBg: 'rgba(0,255,179,0.15)',
  },
  {
    stars: '★★★★★',
    text: 'I was skeptical, but after two weeks my team\'s output improved by 40%. The data doesn\'t lie.',
    name: 'Lucas Silva',
    role: 'Engineering Manager @ Figma',
    avatar: '👨‍🎨',
    avatarBg: 'rgba(255,111,145,0.15)',
  },
  {
    stars: '★★★★★',
    text: 'The deep focus mode alone is worth the subscription. I finally finish what I start.',
    name: 'Sofia Novak',
    role: 'Lead UX Researcher',
    avatar: '👩‍🔬',
    avatarBg: 'rgba(124,92,252,0.2)',
  },
  {
    stars: '★★★★★',
    text: 'Incredibly polished experience. Every interaction feels intentional and delightful. 10/10.',
    name: 'Daniel Park',
    role: 'Creative Director',
    avatar: '🎨',
    avatarBg: 'rgba(0,229,255,0.15)',
  },
];

// Duplicate for seamless marquee loop
const all = [...testimonials, ...testimonials];

export default function Testimonials() {
  return (
    <section className="testimonials" id="testimonials" aria-labelledby="testimonials-title">
      <div className="container">
        <header className="testimonials__header">
          <span className="section-label" aria-hidden="true">✦ Testimonials</span>
          <h2 className="testimonials__title" id="testimonials-title">
            Loved by <span className="gradient-text">120K+ users</span>
          </h2>
        </header>
      </div>

      {/* Marquee (outside container for full-width) */}
      <div className="testimonials__marquee-wrap" aria-label="User testimonials carousel">
        <div className="testimonials__track">
          {all.map((t, i) => (
            <article key={i} className="testimonial-card" id={`testimonial-${i}`}>
              <div className="testimonial-card__stars" aria-label="5 stars">{t.stars}</div>
              <blockquote className="testimonial-card__text">"{t.text}"</blockquote>
              <div className="testimonial-card__author">
                <div
                  className="testimonial-card__avatar"
                  style={{ background: t.avatarBg }}
                  aria-hidden="true"
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="testimonial-card__name">{t.name}</div>
                  <div className="testimonial-card__role">{t.role}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
