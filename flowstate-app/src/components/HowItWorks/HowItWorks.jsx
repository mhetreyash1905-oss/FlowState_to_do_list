import './HowItWorks.css';

const steps = [
  {
    number: '01',
    numClass: 'step-num--1',
    icon: '📝',
    title: 'Capture Your Tasks',
    desc: 'Add tasks quickly via keyboard shortcuts, voice input, or by connecting your existing tools. Nothing falls through the cracks.',
  },
  {
    number: '02',
    numClass: 'step-num--2',
    icon: '⚡',
    title: 'Plan with AI',
    desc: 'FlowState intelligently schedules your day based on task priority, your energy patterns, and available time blocks.',
  },
  {
    number: '03',
    numClass: 'step-num--3',
    icon: '🏆',
    title: 'Execute & Grow',
    desc: 'Enter deep focus mode, track your progress in real time, and celebrate wins with detailed productivity reports.',
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works" aria-labelledby="how-title">
      <div className="container">
        <header className="how-it-works__header">
          <span className="section-label" aria-hidden="true">✦ How It Works</span>
          <h2 className="how-it-works__title" id="how-title">
            Three steps to your{' '}
            <span className="gradient-text">best day</span>
          </h2>
          <p className="how-it-works__subtitle">
            No complex setup. Just open FlowState and start achieving.
          </p>
        </header>

        <div className="how-it-works__steps" role="list">
          {steps.map((step, i) => (
            <div key={i} className="step" role="listitem" id={`step-${i + 1}`}>
              <div className={`step__number ${step.numClass}`} aria-hidden="true">
                {step.number}
              </div>
              <div className="step__icon" aria-hidden="true">{step.icon}</div>
              <h3 className="step__title">{step.title}</h3>
              <p className="step__desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
