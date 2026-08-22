export const config = {
  appName: 'RenoLeads',
  seller: {
    name: 'RenoLeads',
    role: 'Polomolok land lot service',
    area: 'Serving Polomolok, South Cotabato',
  },
  contact: {
    phoneDisplay: '',
    phoneTel: '',
    email: '',
    address: 'Polomolok, South Cotabato, Philippines',
  },
  backend: {
    endpoint: 'https://dnsgfsgpopniqeuqfslp.supabase.co/functions/v1/api',
    source: 'renoleads',
    privacyNoticeVersion: '2026-08-22',
    timeoutMs: 12_000,
  },
} as const;
