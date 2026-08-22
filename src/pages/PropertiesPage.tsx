import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PropertyCard } from '../components/PropertyCard';
import { usePageTitle } from '../hooks/usePageTitle';
import { useSavedLotIds } from '../lib/storage';
import { useProperties } from '../state/PropertyContext';

function dateValue(value: string | null) {
  const parsed = value ? Date.parse(value) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function PropertiesPage() {
  const [params, setParams] = useSearchParams();
  const { properties, loading, error } = useProperties();
  const savedIds = useSavedLotIds();
  const savedOnly = params.get('filter') === 'saved';
  const budget = params.get('budget') ?? '';
  const area = params.get('area') ?? '';
  const sort = params.get('sort') ?? 'updated';
  usePageTitle(savedOnly ? 'Saved lots | renoleads' : 'Available lots | renoleads');

  const filtered = useMemo(() => {
    let rows = properties.slice();
    if (savedOnly) rows = rows.filter((property) => savedIds.includes(property.id));
    if (budget) rows = rows.filter((property) => property.displayPrice !== null && property.displayPrice <= Number(budget));
    if (area) {
      const [minRaw, maxRaw] = area.split('-');
      const min = Number(minRaw || 0);
      const max = Number(maxRaw || 0);
      rows = rows.filter((property) => property.areaSqm !== null && property.areaSqm >= min && (!max || property.areaSqm <= max));
    }
    rows.sort((first, second) => {
      if (sort === 'price-asc') return (first.displayPrice ?? Number.POSITIVE_INFINITY) - (second.displayPrice ?? Number.POSITIVE_INFINITY);
      if (sort === 'price-desc') return (second.displayPrice ?? Number.NEGATIVE_INFINITY) - (first.displayPrice ?? Number.NEGATIVE_INFINITY);
      if (sort === 'area-asc') return (first.areaSqm ?? Number.POSITIVE_INFINITY) - (second.areaSqm ?? Number.POSITIVE_INFINITY);
      return dateValue(second.updatedAt) - dateValue(first.updatedAt);
    });
    return rows;
  }, [area, budget, properties, savedIds, savedOnly, sort]);

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  function clearFilters() {
    const next = new URLSearchParams();
    if (savedOnly) next.set('filter', 'saved');
    setParams(next, { replace: true });
  }

  return <section className="catalog-section section-padding">
    <div className="container">
      <div className="catalog-heading-row" data-reveal="up"><div><span className="section-eyebrow">NJ125 published inventory</span><h1 id="catalog-heading">{savedOnly ? 'Saved lots' : 'Available lots'}</h1><p id="catalog-subtitle">{savedOnly ? 'Your shortlist, stored only on this device.' : 'Only lots currently published and available in NJ125 appear here.'}</p></div><div className="catalog-count" aria-live="polite">{loading ? 'Loading…' : `${filtered.length} lot${filtered.length === 1 ? '' : 's'}`}</div></div>

      <div className="catalog-toolbar" aria-label="Property filters" data-reveal="up">
        <div className="filter-group"><label htmlFor="filter-max-price">Maximum price</label><select id="filter-max-price" value={budget} onChange={(event) => setFilter('budget', event.target.value)}><option value="">Any price</option><option value="750000">PHP 750,000</option><option value="1000000">PHP 1,000,000</option><option value="1500000">PHP 1,500,000</option><option value="2500000">PHP 2,500,000</option></select></div>
        <div className="filter-group"><label htmlFor="filter-area">Lot area</label><select id="filter-area" value={area} onChange={(event) => setFilter('area', event.target.value)}><option value="">Any area</option><option value="0-150">Up to 150 sqm</option><option value="151-250">151–250 sqm</option><option value="251-500">251–500 sqm</option><option value="501-0">501+ sqm</option></select></div>
        <div className="filter-group"><label htmlFor="filter-sort">Sort</label><select id="filter-sort" value={sort} onChange={(event) => setFilter('sort', event.target.value)}><option value="updated">Recently updated</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="area-asc">Area: small to large</option></select></div>
        <button className="btn btn-outline btn-sm" type="button" onClick={clearFilters}>Clear filters</button>
      </div>

      <div className="properties-grid" aria-live="polite">
        {loading ? Array.from({ length: 6 }, (_, index) => <div className="skeleton skeleton-card" key={index}/>) : null}
        {!loading && error ? <div className="empty-state" data-reveal="up"><h2 className="empty-state-title">Property service unavailable</h2><p className="empty-state-text">{error}</p></div> : null}
        {!loading && !error && filtered.length === 0 ? <div className="empty-state" data-reveal="up"><h2 className="empty-state-title">{savedOnly ? 'No saved lots' : 'No matching properties'}</h2><p className="empty-state-text">{savedOnly ? 'Save a published lot to keep it on this device.' : 'There are no published available lots matching these filters.'}</p></div> : null}
        {!loading && !error ? filtered.map((property) => <PropertyCard key={property.id} property={property}/>) : null}
      </div>
    </div>
  </section>;
}
