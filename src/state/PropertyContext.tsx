import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchPublishedProperties } from '../lib/propertyApi';
import type { Property } from '../types';

type PropertyState = {
  properties: Property[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const PropertyContext = createContext<PropertyState | null>(null);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const result = await fetchPublishedProperties({ page: 1, pageSize: 24, sort: 'updated' });
      setProperties(result.properties);
      setError(null);
    } catch {
      setError('Property information is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => { if (!document.hidden) void refresh(); }, 60_000);
    const focus = () => { void refresh(); };
    window.addEventListener('focus', focus);
    return () => { window.clearInterval(interval); window.removeEventListener('focus', focus); };
  }, [refresh]);

  const value = useMemo<PropertyState>(() => ({ properties, loading, error, refresh }), [properties, loading, error, refresh]);
  return <PropertyContext.Provider value={value}>{children}</PropertyContext.Provider>;
}

export function useProperties() {
  const value = useContext(PropertyContext);
  if (!value) throw new Error('useProperties must be used inside PropertyProvider');
  return value;
}
