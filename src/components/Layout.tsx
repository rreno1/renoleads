import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { config } from '../config';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Icon } from './Icon';

function Brand() {
  return <Link className="brand-logo" to="/" aria-label="renoleads home"><Icon name="home"/><span>renoleads</span></Link>;
}

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const routeKey = `${location.pathname}${location.search}`;
  const savedView = location.pathname.includes('properties') && new URLSearchParams(location.search).get('filter') === 'saved';
  const propertiesActive = location.pathname.includes('properties') && !savedView;
  const contactActive = location.pathname.includes('contact');

  useScrollReveal(routeKey);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [routeKey]);

  useEffect(() => {
    const syncScrollState = () => setScrolled(window.scrollY > 12);
    syncScrollState();
    window.addEventListener('scroll', syncScrollState, { passive: true });
    return () => window.removeEventListener('scroll', syncScrollState);
  }, []);

  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <nav className="navbar container" aria-label="Primary navigation">
        <Brand/>
        <div className="desktop-nav">
          <Link className={`nav-link${propertiesActive ? ' active' : ''}`} aria-current={propertiesActive ? 'page' : undefined} to="/properties">Available lots</Link>
          <Link className={`nav-link${savedView ? ' active' : ''}`} aria-current={savedView ? 'page' : undefined} to="/properties?filter=saved">Saved</Link>
          <Link className={`nav-link${contactActive ? ' active' : ''}`} aria-current={contactActive ? 'page' : undefined} to="/contact">Contact</Link>
        </div>
        <div className="nav-actions"><Link className="btn btn-accent btn-sm" to="/properties">View available lots</Link></div>
        <button className={`mobile-menu-toggle${mobileOpen ? ' is-open' : ''}`} type="button" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} aria-controls="mobile-menu" onClick={() => setMobileOpen((value) => !value)}><span aria-hidden="true"/><span aria-hidden="true"/></button>
      </nav>
      <nav className={`mobile-menu${mobileOpen ? ' is-open' : ''}`} id="mobile-menu" aria-label="Mobile navigation" hidden={!mobileOpen}>
        <div className="mobile-menu-inner container">
          <Link className="mobile-menu-link" to="/">Home</Link>
          <Link className="mobile-menu-link" to="/properties">Available lots</Link>
          <Link className="mobile-menu-link" to="/properties?filter=saved">Saved lots</Link>
          <Link className="mobile-menu-link" to="/contact">Contact</Link>
        </div>
      </nav>
    </header>

    <main id="main-content">{children}</main>

    <footer className="site-footer" data-reveal="up">
      <div className="container footer-grid">
        <div className="footer-brand"><Brand/><p>Focused land-lot discovery for Polomolok, South Cotabato.</p></div>
        <div className="footer-links"><h2 className="footer-heading">Explore</h2><Link to="/properties">Available lots</Link><Link to="/properties?filter=saved">Saved lots</Link><Link to="/why-polomolok">Why Polomolok</Link><Link to="/buying-process">Buying process</Link></div>
        <div className="footer-links"><h2 className="footer-heading">Contact</h2><Link to="/contact">Send an inquiry</Link>{config.contact.phoneTel ? <a className="footer-contact-item" href={`tel:${config.contact.phoneTel}`}><Icon name="phone"/><span>{config.contact.phoneDisplay}</span></a> : null}{config.contact.email ? <a className="footer-contact-item" href={`mailto:${config.contact.email}`}><Icon name="mail"/><span>{config.contact.email}</span></a> : null}<span className="footer-contact-item"><Icon name="map"/><span>{config.contact.address}</span></span></div>
      </div>
      <div className="container footer-bottom"><span>© 2026 renoleads. Verify property details before purchase.</span><Link to="/privacy">Privacy</Link></div>
    </footer>
  </>;
}
