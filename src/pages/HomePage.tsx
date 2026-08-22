import { Link } from 'react-router-dom';
import heroImage from '../../assets/images/polomolok-hero-bg.jpg';
import { PropertyCard } from '../components/PropertyCard';
import { usePageTitle } from '../hooks/usePageTitle';
import { getRecentlyViewed } from '../lib/storage';
import { useProperties } from '../state/PropertyContext';

export function HomePage() {
  usePageTitle('RenoLeads | Land lots in Polomolok');
  const { properties, loading, error } = useProperties();
  const recentIds = getRecentlyViewed();
  const recent = recentIds.flatMap((id) => {
    const property = properties.find((item) => item.id === id);
    return property ? [property] : [];
  }).slice(0, 4);

  return <>
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-content">
          <span className="hero-eyebrow">Polomolok, South Cotabato</span>
          <h1 className="hero-title">Land worth a closer look.</h1>
          <p className="hero-description">Browse published available lots from the NJ125 inventory, compare the facts that matter, and ask for a site visit when a property deserves a closer look.</p>
          <div className="hero-actions"><Link className="btn btn-primary btn-lg" to="/properties">Explore available lots</Link><Link className="btn btn-outline btn-lg" to="/contact">Ask a question</Link></div>
          <div className="hero-trust"><span>Clear listing information, practical next steps, and room to verify.</span></div>
        </div>
        <div className="hero-visual"><img className="hero-image" src={heroImage} alt="Green agricultural fields below Mount Matutum near Polomolok" width={1368} height={768}/><div className="hero-caption">Place context · Mount Matutum and the Polomolok landscape</div></div>
      </div>
    </section>

    <section className="discovery-section" aria-labelledby="discovery-title">
      <div className="container">
        <div className="section-header section-header-inline"><div><span className="section-eyebrow">Start with what is published</span><h2 id="discovery-title">Find an available lot.</h2></div><Link className="text-link" to="/properties">See all lots <span aria-hidden="true">→</span></Link></div>
        <div className="discovery-chips"><Link className="discovery-chip" to="/properties">All available lots</Link><Link className="discovery-chip" to="/properties?budget=1500000">Up to PHP 1.5M</Link><Link className="discovery-chip" to="/properties?area=0-250">Up to 250 sqm</Link><Link className="discovery-chip" to="/properties?filter=saved">My saved lots</Link></div>
      </div>
    </section>

    <section className="section-padding" aria-labelledby="featured-title">
      <div className="container">
        <div className="section-header section-header-inline"><div><span className="section-eyebrow">A short list to begin</span><h2 id="featured-title">Available lots</h2><p>Every card below comes from the shared NJ125 operations database.</p></div><Link className="btn btn-outline btn-sm" to="/properties">View all lots</Link></div>
        <div className="properties-grid" aria-live="polite">
          {loading ? Array.from({ length: 3 }, (_, index) => <div className="skeleton skeleton-card" key={index}/>) : null}
          {!loading && error ? <div className="empty-state"><h3 className="empty-state-title">Property service unavailable</h3><p className="empty-state-text">{error}</p></div> : null}
          {!loading && !error && properties.length === 0 ? <div className="empty-state"><h3 className="empty-state-title">No properties available</h3><p className="empty-state-text">There are no published available lots in NJ125 right now.</p></div> : null}
          {!loading && !error ? properties.slice(0, 4).map((property) => <PropertyCard key={property.id} property={property}/>) : null}
        </div>
      </div>
    </section>

    <section className="credibility-section" aria-labelledby="credibility-title">
      <div className="container credibility-grid"><div className="seller-profile"><div className="seller-avatar" aria-hidden="true">R</div><div className="seller-info"><strong className="seller-name" id="credibility-title">RenoLeads</strong><span className="seller-role">Polomolok land lot service</span><span className="seller-area">Connected directly to NJ125 inventory</span></div></div><div><span className="section-eyebrow">A calmer way to decide</span><h2>See what is known, then verify what matters.</h2><p>RenoLeads keeps the public funnel focused on authoritative inventory while NJ125 handles the operational records behind each inquiry.</p></div></div>
    </section>

    <section className="why-section" aria-labelledby="why-title">
      <div className="container why-grid"><img className="why-image" src={heroImage} alt="Agricultural landscape and Mount Matutum in the distance" width={1368} height={768} loading="lazy"/><div className="why-content"><div><span className="section-eyebrow">Why this place</span><h2 id="why-title">A local view of land decisions.</h2><p>Polomolok combines a working agricultural landscape with town, highway, and community context. The right lot depends on your intended use and the facts you can verify on site.</p></div><div className="why-facts"><div className="why-fact"><div><h3>Focused inventory</h3><p>Compare the lots that NJ125 has actually published as available.</p></div></div><div className="why-fact"><div><h3>Due diligence stays visible</h3><p>Ask about title, survey, access, utilities, boundaries, and any conditions before you commit.</p></div></div><div className="why-fact"><div><h3>Site visits are practical</h3><p>Use each listing as a starting point for a conversation, not as a substitute for inspecting the land.</p></div></div></div><Link className="text-link" to="/why-polomolok">Read the local context <span aria-hidden="true">→</span></Link></div></div>
    </section>

    {recent.length ? <section className="property-strip-section" aria-labelledby="recently-viewed-title"><div className="container"><div className="section-header section-header-inline"><div><span className="section-eyebrow">Keep your place</span><h2 id="recently-viewed-title">Recently viewed</h2></div><span className="text-muted">Stored on this device</span></div><div className="property-strip">{recent.map((property) => <PropertyCard key={property.id} property={property} compact/>)}</div></div></section> : null}

    <section className="inquiry-panel" aria-labelledby="inquiry-title"><div className="container"><div className="inquiry-panel-inner"><span className="section-eyebrow">Ready when you are</span><h2 id="inquiry-title">Have a lot in mind?</h2><p>Tell us what you are looking for, or ask about a specific published listing.</p><Link className="btn btn-accent btn-lg" to="/contact">Start an inquiry</Link></div></div></section>
  </>;
}
