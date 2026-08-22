import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PropertyCard } from '../components/PropertyCard';
import { usePageTitle } from '../hooks/usePageTitle';
import { fetchPublishedProperties } from '../lib/propertyApi';
import { useSavedLotIds } from '../lib/storage';
import { useProperties } from '../state/PropertyContext';
import type { Property } from '../types';

function areaBounds(value: string) {
  if (!value) return { minArea: null, maxArea: null };
  const [minRaw, maxRaw] = value.split('-');
  const min = Number(minRaw || 0);
  const max = Number(maxRaw || 0);
  return { minArea: min || null, maxArea: max || null };
}

export function PropertiesPage() {
  const [params, setParams] = useSearchParams();
  const shared = useProperties();
  const savedIds = useSavedLotIds();
  const savedOnly = params.get('filter') === 'saved';
  const budget = params.get('budget') ?? '';
  const area = params.get('area') ?? '';
  const sort = (params.get('sort') ?? 'updated') as 'updated'|'price-asc'|'price-desc'|'area-asc';
  const page = Math.max(1, Number(params.get('page') || 1));
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(!savedOnly);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  usePageTitle(savedOnly ? 'Saved lots | renoleads' : 'Available lots | renoleads');

  const saved = useMemo(() => shared.properties.filter((property) => savedIds.includes(property.id)), [shared.properties, savedIds]);

  async function load() {
    if (savedOnly) return;
    setLoading(true); setError(null);
    try {
      const bounds = areaBounds(area);
      const result = await fetchPublishedProperties({ page, pageSize: 24, maxPrice: budget ? Number(budget) : null, minArea: bounds.minArea, maxArea: bounds.maxArea, sort });
      setProperties(result.properties); setHasMore(result.hasMore);
    } catch { setProperties([]); setHasMore(false); setError('Property information is temporarily unavailable.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, [savedOnly, budget, area, sort, page]);

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setParams(next, { replace: true });
  }
  function setPage(nextPage: number) {
    const next = new URLSearchParams(params); if (nextPage <= 1) next.delete('page'); else next.set('page', String(nextPage)); setParams(next, { replace: true }); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function clearFilters() { const next = new URLSearchParams(); if (savedOnly) next.set('filter', 'saved'); setParams(next, { replace: true }); }

  const visible = savedOnly ? saved : properties;
  const currentError = savedOnly ? shared.error : error;
  const currentLoading = savedOnly ? shared.loading : loading;

  return <section className="catalog-section section-padding">
    <div className="container">
      <div className="catalog-heading-row" data-reveal="up"><div><span className="section-eyebrow">Published inventory</span><h1 id="catalog-heading">{savedOnly ? 'Saved lots' : 'Available lots'}</h1><p id="catalog-subtitle">{savedOnly ? 'Your shortlist, stored only on this device.' : 'Only lots currently published and available appear here.'}</p></div><div className="catalog-count" aria-live="polite">{currentLoading ? 'Loading…' : savedOnly ? `${visible.length} saved` : `${visible.length} on page ${page}`}</div></div>

      {!savedOnly ? <div className="catalog-toolbar" aria-label="Property filters" data-reveal="up">
        <div className="filter-group"><label htmlFor="filter-max-price">Maximum price</label><select id="filter-max-price" value={budget} onChange={(event) => setFilter('budget', event.target.value)}><option value="">Any price</option><option value="750000">PHP 750,000</option><option value="1000000">PHP 1,000,000</option><option value="1500000">PHP 1,500,000</option><option value="2500000">PHP 2,500,000</option></select></div>
        <div className="filter-group"><label htmlFor="filter-area">Lot area</label><select id="filter-area" value={area} onChange={(event) => setFilter('area', event.target.value)}><option value="">Any area</option><option value="0-150">Up to 150 sqm</option><option value="151-250">151–250 sqm</option><option value="251-500">251–500 sqm</option><option value="501-0">501+ sqm</option></select></div>
        <div className="filter-group"><label htmlFor="filter-sort">Sort</label><select id="filter-sort" value={sort} onChange={(event) => setFilter('sort', event.target.value)}><option value="updated">Recently updated</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="area-asc">Area: small to large</option></select></div>
        <button className="btn btn-outline btn-sm" type="button" onClick={clearFilters}>Clear filters</button>
      </div> : null}

      <div className="properties-grid" aria-live="polite">
        {currentLoading ? Array.from({ length: 6 }, (_, index) => <div className="skeleton skeleton-card" key={index}/>) : null}
        {!currentLoading && currentError ? <div className="empty-state" data-reveal="up"><h2 className="empty-state-title">Property service unavailable</h2><p className="empty-state-text">{currentError}</p><button className="btn btn-outline" type="button" onClick={() => savedOnly ? void shared.refresh() : void load()}>Try again</button></div> : null}
        {!currentLoading && !currentError && visible.length === 0 ? <div className="empty-state" data-reveal="up"><h2 className="empty-state-title">{savedOnly ? 'No saved lots' : 'No matching properties'}</h2><p className="empty-state-text">{savedOnly ? 'Save a published lot to keep it on this device.' : 'There are no published available lots matching these filters.'}</p></div> : null}
        {!currentLoading && !currentError ? visible.map((property) => <PropertyCard key={property.id} property={property}/>) : null}
      </div>

      {!savedOnly && !currentLoading && !currentError && (page > 1 || hasMore) ? <nav className="catalog-pagination" aria-label="Property pages"><button className="btn btn-outline" type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page}</span><button className="btn btn-primary" type="button" disabled={!hasMore} onClick={() => setPage(page + 1)}>Next</button></nav> : null}
    </div>
  </section>;
}
