import './Footer.css';

const footerLinks = {
  Product: ['Features', 'How It Works', 'Pricing', 'Changelog', 'Roadmap'],
  Company:  ['About Us', 'Blog', 'Careers', 'Press Kit', 'Contact'],
  Legal:    ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
};

const socials = ['𝕏', 'in', '▶', '⬛'];

export default function Footer() {
  return (
    <footer className="footer" aria-label="Site footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__brand-name">⚡ FlowState</div>
            <p className="footer__brand-desc">
              The productivity platform built for people who want to do great work — without sacrificing their wellbeing.
            </p>
            <div className="footer__socials" aria-label="Social media links">
              {socials.map((s, i) => (
                <a key={i} href="#" className="footer__social" aria-label={`Social link ${i + 1}`} id={`footer-social-${i}`}>
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="footer__col">
              <h3 className="footer__col-title">{title}</h3>
              <ul className="footer__links" role="list">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="footer__link"
                      id={`footer-link-${link.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="footer__bottom">
          <p className="footer__copy">
            © 2025 <span>FlowState Inc.</span> · All rights reserved.
          </p>
          <div className="footer__bottom-links">
            <a href="#" className="footer__bottom-link" id="footer-privacy">Privacy</a>
            <a href="#" className="footer__bottom-link" id="footer-terms">Terms</a>
            <a href="#" className="footer__bottom-link" id="footer-cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
