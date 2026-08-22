import { useSyncExternalStore } from 'react';

const SAVED_KEY = 'renoleads_saved_lot_ids_v2';
const RECENT_KEY = 'renoleads_recent_lot_ids_v2';
const SAVED_EVENT = 'renoleads:saved-changed';

function readIds(key: string): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string').slice(0, 100) : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify([...new Set(ids)].slice(0, 100)));
  } catch {
    // Storage is a convenience only; the public site must work without it.
  }
}

export function isSaved(id: string) {
  return readIds(SAVED_KEY).includes(id);
}

export function toggleSaved(id: string) {
  const ids = readIds(SAVED_KEY);
  const next = ids.includes(id) ? ids.filter((value) => value !== id) : [id, ...ids];
  writeIds(SAVED_KEY, next);
  window.dispatchEvent(new Event(SAVED_EVENT));
  return next.includes(id);
}

export function addRecentlyViewed(id: string) {
  const next = [id, ...readIds(RECENT_KEY).filter((value) => value !== id)].slice(0, 8);
  writeIds(RECENT_KEY, next);
}

export function getRecentlyViewed() {
  return readIds(RECENT_KEY);
}

function subscribeSaved(callback: () => void) {
  const handler = () => callback();
  window.addEventListener(SAVED_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(SAVED_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

let lastSavedRaw = '';
let lastSavedSnapshot: string[] = [];
function getSavedSnapshot() {
  const raw = localStorage.getItem(SAVED_KEY) ?? '[]';
  if (raw !== lastSavedRaw) {
    lastSavedRaw = raw;
    lastSavedSnapshot = readIds(SAVED_KEY);
  }
  return lastSavedSnapshot;
}

export function useSavedLotIds() {
  return useSyncExternalStore(subscribeSaved, getSavedSnapshot, () => []);
}
