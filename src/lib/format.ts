export function formatCurrency(amount: number | null) {
  if (amount === null || !Number.isFinite(amount)) return 'Price on request';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number | null) {
  if (value === null || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-PH').format(value);
}

export function propertyPlacement(phase: string, block: string, lotNumber: string) {
  return [
    phase ? `Phase ${phase}` : '',
    block ? `Block ${block}` : '',
    lotNumber ? `Lot ${lotNumber}` : '',
  ].filter(Boolean).join(' · ');
}
