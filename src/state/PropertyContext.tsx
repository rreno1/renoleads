import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchPublishedProperties } from '../lib/propertyApi';
import type { Property } from '../types';

type PropertyState = {
  properties: Property[];
  loading: boolean;
  error: string | null;
};

const PropertyContext = createContext<PropertyState | null>(null);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PropertyState>({ properties: [], loading: true, error: null });

  useEffect(() => {
    let active = true;
    fetchPublishedProperties()
      .then((properties) => {
        if (active) setState({ properties, loading: false, error: null });
      })
      .catch(() => {
        if (active) setState({ properties: [], loading: false, error: 'Property information is temporarily unavailable.' });
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => state, [state]);
  return <PropertyContext.Provider value={value}>{children}</PropertyContext.Provider>;
}

export function useProperties() {
  const value = useContext(PropertyContext);
  if (!value) throw new Error('useProperties must be used inside PropertyProvider');
  return value;
}
