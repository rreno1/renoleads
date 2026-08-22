const SITE = 'https://renoleads-11e2b.web.app';
const API = 'https://dnsgfsgpopniqeuqfslp.supabase.co/functions/v1/api';
const STAFF_API = 'https://dnsgfsgpopniqeuqfslp.supabase.co/functions/v1/staff-api';
const ORIGIN = SITE;
const STAFF_ORIGIN = 'https://nj125-corp.web.app';
const DENIED_ORIGIN = 'https://example.com';

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

for (const path of ['/', '/properties', '/contact', '/privacy', '/property/00000000-0000-4000-8000-000000000000']) {
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
  body: JSON.stringify({ action: 'public-properties', payload: { page: 1, pageSize: 4, sort: 'updated' } })
});
const feedBody = await feed.json().catch(() => null);
const cacheControl = feed.headers.get('cache-control') || '';
check(feed.status === 200, `public-properties: expected 200, got ${feed.status}`);
check(feed.headers.get('access-control-allow-origin') === ORIGIN, `public-properties: CORS origin mismatch: ${feed.headers.get('access-control-allow-origin')}`);
check(feed.headers.get('x-request-id') === 'renoleads-production-smoke-feed', 'public-properties: request correlation header missing');
check(cacheControl.includes('public') && cacheControl.includes('max-age=60') && cacheControl.includes('stale-while-revalidate=300'), `public-properties: cache contract mismatch: ${cacheControl}`);
check(feedBody?.ok === true && Array.isArray(feedBody?.data?.properties), 'public-properties: invalid response contract');
check(feedBody?.data?.page === 1 && feedBody?.data?.pageSize === 4 && typeof feedBody?.data?.hasMore === 'boolean', `public-properties: pagination metadata mismatch: ${JSON.stringify(feedBody?.data)}`);
check((feedBody?.data?.properties?.length ?? 0) <= 4, 'public-properties: page size exceeded');

const secondPage = await fetch(API, {
  method: 'POST',
  headers: { Origin: ORIGIN, 'Content-Type': 'application/json', 'X-Request-Id': 'renoleads-production-smoke-page-2' },
  body: JSON.stringify({ action: 'public-properties', payload: { page: 2, pageSize: 4, sort: 'updated' } })
});
const secondPageBody = await secondPage.json().catch(() => null);
check(secondPage.status === 200, `public-properties page 2: expected 200, got ${secondPage.status}`);
check(secondPage.headers.get('access-control-allow-origin') === ORIGIN, 'public-properties page 2: CORS origin mismatch');
check(secondPageBody?.ok === true && secondPageBody?.data?.page === 2 && secondPageBody?.data?.pageSize === 4 && Array.isArray(secondPageBody?.data?.properties), `public-properties page 2: pagination contract mismatch: ${JSON.stringify(secondPageBody)}`);
check((secondPageBody?.data?.properties?.length ?? 0) <= 4, 'public-properties page 2: page size exceeded');

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

const denied = await fetch(API, {
  method: 'POST',
  headers: { Origin: DENIED_ORIGIN, 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'public-properties', payload: {} })
});
const deniedBody = await denied.json().catch(() => null);
check(denied.status === 403, `denied origin: expected 403, got ${denied.status}`);
check(denied.headers.get('access-control-allow-origin') === null, 'denied origin: must not emit Access-Control-Allow-Origin');
check(deniedBody?.ok === false && deniedBody?.error?.code === 'origin-denied', `denied origin: expected origin-denied, got ${JSON.stringify(deniedBody)}`);

const staffActionOnPublic = await fetch(API, {
  method: 'POST',
  headers: { Origin: ORIGIN, 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'get-state', payload: {} })
});
const staffActionBody = await staffActionOnPublic.json().catch(() => null);
check(staffActionOnPublic.status === 404, `public boundary isolation: expected 404, got ${staffActionOnPublic.status}`);
check(staffActionBody?.ok === false && staffActionBody?.error?.code === 'unknown-action', `public boundary isolation: expected unknown-action, got ${JSON.stringify(staffActionBody)}`);

const wrongContentType = await fetch(API, {
  method: 'POST',
  headers: { Origin: ORIGIN, 'Content-Type': 'text/plain' },
  body: JSON.stringify({ action: 'public-properties', payload: {} })
});
const wrongContentTypeBody = await wrongContentType.json().catch(() => null);
check(wrongContentType.status === 415, `content type boundary: expected 415, got ${wrongContentType.status}`);
check(wrongContentTypeBody?.ok === false && wrongContentTypeBody?.error?.code === 'unsupported-media-type', `content type boundary: expected unsupported-media-type, got ${JSON.stringify(wrongContentTypeBody)}`);

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
      inquiryType: 'general',
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

const staffPreflight = await fetch(STAFF_API, {
  method: 'OPTIONS',
  headers: {
    Origin: STAFF_ORIGIN,
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'authorization,content-type,x-request-id'
  }
});
check(staffPreflight.status === 204, `staff preflight: expected 204, got ${staffPreflight.status}`);
check(staffPreflight.headers.get('access-control-allow-origin') === STAFF_ORIGIN, `staff preflight: CORS origin mismatch: ${staffPreflight.headers.get('access-control-allow-origin')}`);

const staffUnauthenticated = await fetch(STAFF_API, {
  method: 'POST',
  headers: { Origin: STAFF_ORIGIN, 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'get-state', payload: {} })
});
check(staffUnauthenticated.status === 401, `staff JWT gate: expected 401, got ${staffUnauthenticated.status}`);

if (failures.length) {
  console.error('Production smoke test FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Production smoke test passed.');
console.log(`Published available lots returned: ${feedBody.data.properties.length}`);
