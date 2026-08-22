const SITE = 'https://renoleads-11e2b.web.app';
const API = 'https://dnsgfsgpopniqeuqfslp.supabase.co/functions/v1/api';
const ORIGIN = SITE;

const failures = [];
function check(condition, message) {
  if (!condition) failures.push(message);
}

async function fetchText(path) {
  const response = await fetch(`${SITE}${path}`, { redirect: 'manual' });
  const text = await response.text();
  check(response.status === 200, `${path}: expected HTTP 200, got ${response.status}`);
  check(/<div id="root"><\/div>|<div id="root"\s*><\/div>/.test(text), `${path}: Vite/React root mount missing`);
  return { response, text };
}

for (const path of ['/', '/properties', '/contact', '/privacy', '/property.html?id=00000000-0000-4000-8000-000000000000']) {
  const { response } = await fetchText(path);
  const csp = response.headers.get('content-security-policy') || '';
  check(csp.includes("default-src 'self'"), `${path}: CSP missing expected default-src`);
  check(response.headers.get('x-content-type-options') === 'nosniff', `${path}: X-Content-Type-Options missing`);
}

const assetLinks = await fetch(`${SITE}/.well-known/assetlinks.json`);
check(assetLinks.status === 200, `assetlinks: expected 200, got ${assetLinks.status}`);
check((assetLinks.headers.get('content-type') || '').includes('application/json'), 'assetlinks: expected application/json');

const feed = await fetch(API, {
  method: 'POST',
  headers: {
    Origin: ORIGIN,
    'Content-Type': 'application/json',
    'X-Request-Id': 'renoleads-production-smoke-feed'
  },
  body: JSON.stringify({ action: 'public-properties', payload: {} })
});
const feedBody = await feed.json().catch(() => null);
check(feed.status === 200, `public-properties: expected 200, got ${feed.status}`);
check(feed.headers.get('access-control-allow-origin') === ORIGIN, `public-properties: CORS origin mismatch: ${feed.headers.get('access-control-allow-origin')}`);
check(feedBody?.ok === true && Array.isArray(feedBody?.data?.properties), 'public-properties: invalid response contract');

const preflight = await fetch(API, {
  method: 'OPTIONS',
  headers: {
    Origin: ORIGIN,
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'content-type,x-request-id'
  }
});
check(preflight.status === 204, `preflight: expected 204, got ${preflight.status}`);
check(preflight.headers.get('access-control-allow-origin') === ORIGIN, `preflight: CORS origin mismatch: ${preflight.headers.get('access-control-allow-origin')}`);

// Negative inquiry smoke test: reaches live API/CORS/validation but deliberately omits
// consent so no inquiry/lead/audit business record is created.
const inquiry = await fetch(API, {
  method: 'POST',
  headers: {
    Origin: ORIGIN,
    'Content-Type': 'application/json',
    'X-Request-Id': 'renoleads-production-smoke-inquiry'
  },
  body: JSON.stringify({
    action: 'submit-property-inquiry',
    payload: {
      propertyId: null,
      fullName: 'Production Smoke Test',
      mobileNumber: '+639000000000',
      email: 'smoke-test@example.invalid',
      inquiryType: 'general_question',
      preferredContactMethod: 'email',
      message: 'Non-persistent production smoke test.',
      consent: { accepted: false, noticeVersion: '2026-08-22' },
      attribution: { source: 'renoleads', landingPage: `${SITE}/contact` }
    }
  })
});
const inquiryBody = await inquiry.json().catch(() => null);
check(inquiry.status === 400, `inquiry validation: expected 400, got ${inquiry.status}`);
check(inquiry.headers.get('access-control-allow-origin') === ORIGIN, `inquiry validation: CORS origin mismatch: ${inquiry.headers.get('access-control-allow-origin')}`);
check(inquiryBody?.ok === false && inquiryBody?.error?.code === 'consent-required', `inquiry validation: expected consent-required, got ${JSON.stringify(inquiryBody)}`);

if (failures.length) {
  console.error('Production smoke test FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Production smoke test passed.');
console.log(`Published available lots returned: ${feedBody.data.properties.length}`);
