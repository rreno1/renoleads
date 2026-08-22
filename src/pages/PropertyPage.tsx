import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { InquiryForm } from '../components/InquiryForm';
import { PropertyCard } from '../components/PropertyCard';
import { usePageTitle } from '../hooks/usePageTitle';
import { formatCurrency, formatNumber, propertyPlacement } from '../lib/format';
import { addRecentlyViewed, toggleSaved, useSavedLotIds } from '../lib/storage';
import { useProperties } from '../state/PropertyContext';

export function PropertyPage() {
  const route = useParams<{ id: string }>();
  const { properties, loading, error } = useProperties();
  const savedIds = useSavedLotIds();
  const requestedId = route.id ?? '';
  const property = properties.find((item) => item.id === requestedId || item.slug === requestedId) ?? null;
  const [activeImage, setActiveImage] = useState(0);
  usePageTitle(property ? `${property.title} | renoleads` : 'Property | renoleads');

  useEffect(() => {
    if (property) addRecentlyViewed(property.id);
  }, [property]);

  const similar = useMemo(() => {
    if (!property) return [];
    return properties.filter((item) => item.id !== property.id && (item.project === property.project || item.municipality === property.municipality)).slice(0, 3);
  }, [properties, property]);

  if (loading) return <section className="section-padding"><div className="container"><div className="skeleton detail-header"/><div className="skeleton gallery skeleton-detail-media"/><div className="skeleton spec-section skeleton-detail-copy"/></div></section>;
  if (error) return <State title="Property service unavailable" text={error}/>;
  if (!property) return <State title="Property not found" text="This listing may have been removed, unpublished, sold, reserved, or the link may be incomplete."/>;

  const currentProperty = property;
  const location = [currentProperty.municipality, currentProperty.province].filter(Boolean).join(', ') || 'Location available on inquiry';
  const placement = propertyPlacement(currentProperty.phase, currentProperty.block, currentProperty.lotNumber);
  const saved = savedIds.includes(currentProperty.id);
  const currentMedia = currentProperty.media[activeImage] ?? currentProperty.media[0];

  async function share() {
    const data = { title: currentProperty.title, text: `${currentProperty.title} in ${location}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else await navigator.clipboard.writeText(window.location.href);
    } catch (caught: unknown) {
      if (caught instanceof DOMException && caught.name === 'AbortError') return;
    }
  }

  return <div className="container property-detail-container">
    <nav className="detail-breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">›</span><Link to="/properties">Available lots</Link><span aria-hidden="true">›</span><span aria-current="page">{currentProperty.lotNumber ? `Lot ${currentProperty.lotNumber}` : currentProperty.title}</span></nav>

    <header className="detail-header" data-reveal="up">
      <div className="detail-title-group"><div className="detail-status-row"><span className="badge badge-available">Available</span><span className="detail-verified">{placement || currentProperty.project || 'Published lot'}</span></div><h1 className="detail-title">{currentProperty.title}</h1><div className="detail-location"><Icon name="map"/><span>{location}</span></div><div className="detail-price-area"><strong className="detail-price">{formatCurrency(currentProperty.displayPrice)}</strong>{currentProperty.areaSqm !== null ? <span className="detail-area">{formatNumber(currentProperty.areaSqm)} sqm</span> : null}</div></div>
      <div className="detail-actions"><button type="button" className={`detail-action-btn${saved ? ' saved' : ''}`} aria-label={saved ? 'Remove from saved' : 'Save property'} aria-pressed={saved} onClick={() => toggleSaved(currentProperty.id)}><Icon name="heart"/></button><button type="button" className="detail-action-btn" aria-label="Share property" onClick={() => void share()}><Icon name="share"/></button></div>
    </header>

    <div className="detail-layout">
      <div className="detail-main">
        <section className="gallery-section" data-reveal="up">
          {currentMedia ? <div className="gallery"><div className="gallery-main"><img src={currentMedia.url} alt={currentMedia.alt || currentProperty.title} loading="eager" decoding="async" fetchPriority="high"/><span className="gallery-count">{currentProperty.media.length} photo{currentProperty.media.length === 1 ? '' : 's'}</span></div>{currentProperty.media.length > 1 ? <div className="gallery-thumbs">{currentProperty.media.map((media, index) => <button key={`${media.url}-${index}`} type="button" className={`gallery-thumb${index === activeImage ? ' active' : ''}`} aria-label={`View property photo ${index + 1}`} onClick={() => setActiveImage(index)}><img src={media.url} alt={media.alt || `Property photo ${index + 1}`} loading="lazy" decoding="async" fetchPriority="low"/></button>)}</div> : null}</div> : <div className="gallery gallery-placeholder"><Icon name="area"/><strong>Property photos coming soon</strong><span>Ask for current site photos in your inquiry.</span></div>}
        </section>

        <section className="spec-section" data-reveal="up"><h2 className="spec-section-title">Property details</h2><dl className="spec-grid"><Spec label="Project" value={currentProperty.project || 'Ask for details'}/><Spec label="Phase" value={currentProperty.phase || 'Ask for details'}/><Spec label="Block" value={currentProperty.block || 'Ask for details'}/><Spec label="Lot" value={currentProperty.lotNumber || 'Ask for details'}/><Spec label="Lot area" value={currentProperty.areaSqm !== null ? `${formatNumber(currentProperty.areaSqm)} sqm` : 'Ask for details'}/><Spec label="Published price" value={formatCurrency(currentProperty.displayPrice)}/><Spec label="Availability" value="Available"/><Spec label="Location" value={location}/></dl></section>

        {currentProperty.description ? <section className="spec-section detail-copy" data-reveal="up"><h2 className="spec-section-title">About this property</h2><p>{currentProperty.description}</p></section> : null}
        <section className="spec-section detail-copy" data-reveal="up"><h2 className="spec-section-title">What to verify</h2><p>Confirm ownership, survey and boundaries, access, utilities, final price, payment terms, taxes, and any other material condition before making a commitment.</p></section>

        {similar.length ? <section className="spec-section similar-section"><h2 className="spec-section-title" data-reveal="up">More lots to compare</h2><div className="properties-grid">{similar.map((item) => <PropertyCard key={item.id} property={item}/>)}</div></section> : null}
      </div>

      <aside className="detail-sidebar" data-reveal="right"><div className="sidebar-card detail-cta-card"><h2 className="sidebar-card-title">Ask about this lot</h2><p>Request current photos, documents, boundary details, final terms, or a site visit.</p><InquiryForm property={currentProperty} compact/></div><div className="seller-profile"><div className="seller-avatar" aria-hidden="true">R</div><div className="seller-info"><strong className="seller-name">renoleads</strong><span className="seller-role">Polomolok land lot service</span><span className="seller-area">Live published inventory</span></div></div></aside>
    </div>
  </div>;
}

function Spec({ label, value }: { label: string; value: string }) {
  return <div className="spec-item"><dt className="spec-label">{label}</dt><dd className="spec-value">{value}</dd></div>;
}

function State({ title, text }: { title: string; text: string }) {
  return <section className="section-padding"><div className="container"><div className="empty-state detail-not-found" data-reveal="up"><Icon name="info"/><h1 className="empty-state-title">{title}</h1><p className="empty-state-text">{text}</p><Link className="btn btn-primary" to="/properties">Browse available lots</Link></div></div></section>;
}
