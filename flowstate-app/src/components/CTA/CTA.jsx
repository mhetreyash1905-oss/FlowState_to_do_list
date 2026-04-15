import './CTA.css';

export default function CTA() {
  return (
    <section className="cta" id="pricing" aria-labelledby="cta-title">
      <div className="container">
        <div className="cta__inner">
          <h2 className="cta__title" id="cta-title">
            Ready to enter your{' '}
            <span className="gradient-text">flow state?</span>
          </h2>
          <p className="cta__subtitle">
            Join 120,000+ achievers using FlowState to get their best work done. Free forever — upgrade anytime.
          </p>
          <div className="cta__actions">
            <button className="btn-cta" id="cta-primary">
              ✦ Start Free Today
            </button>
          </div>
          <p className="cta__note">
            <span>✓ No credit card required</span> · Free for individuals · Trusted by teams at Fortune 500 companies
          </p>
        </div>
      </div>
    </section>
  );
}
