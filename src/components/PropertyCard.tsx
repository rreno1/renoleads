import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatNumber, propertyPlacement } from '../lib/format';
import { toggleSaved, useSavedLotIds } from '../lib/storage';
import type { Property } from '../types';
import { Icon } from './Icon';

export function PropertyCard({ property, compact = false }: { property: Property; compact?: boolean }) {
  const savedIds = useSavedLotIds();
  const saved = savedIds.includes(property.id);
  const [imageFailed, setImageFailed] = useState(false);
  const image = property.media[0]?.url ?? '';
  const placement = propertyPlacement(property.phase, property.block, property.lotNumber);

  return <article className={compact ? 'property-card property-card-compact' : 'property-card'}>
    <div className="card-image-wrap">
      <Link className="card-image-link" to={`/property/${encodeURIComponent(property.id)}`} aria-label={`View ${property.title}`}>
        {image && !imageFailed ? <div className={compact ? 'property-media property-media-compact' : 'property-media'}><img src={image} alt={property.media[0]?.alt || property.title} loading="lazy" onError={() => setImageFailed(true)}/></div> : <div className={compact ? 'property-media-placeholder property-media-placeholder-compact' : 'property-media-placeholder'}><Icon name="area"/><span className="property-media-copy">Photos coming soon</span><small>{property.lotNumber ? `Lot ${property.lotNumber}` : 'LOT'}</small></div>}
      </Link>
      <span className="badge card-status-badge badge-available">Available</span>
      <button className={`card-save-btn${saved ? ' saved' : ''}`} type="button" aria-label={saved ? 'Remove from saved' : 'Save property'} aria-pressed={saved} onClick={() => toggleSaved(property.id)}><Icon name="heart"/></button>
    </div>
    <div className="card-body">
      <span className="card-eyebrow">{property.project ? `${property.project} · Land lot` : 'Land lot'}</span>
      <h3 className="card-title"><Link to={`/property/${encodeURIComponent(property.id)}`}>{property.title}</Link></h3>
      <div className="card-location"><Icon name="map"/><span>{[property.municipality, property.province].filter(Boolean).join(', ') || 'Location available on inquiry'}</span></div>
      <div className="card-price">{formatCurrency(property.displayPrice)}</div>
      <div className="card-specs">
        {property.areaSqm !== null ? <span className="card-spec"><Icon name="area"/><span>{formatNumber(property.areaSqm)} sqm</span></span> : null}
        {placement ? <span className="card-spec"><Icon name="document"/><span>{placement}</span></span> : null}
      </div>
      <div className="card-actions"><Link className="btn btn-primary btn-sm" to={`/property/${encodeURIComponent(property.id)}`}>View details</Link><Link className="btn btn-outline btn-sm" to={`/contact?property=${encodeURIComponent(property.id)}`}>Quick inquiry</Link></div>
    </div>
  </article>;
}
