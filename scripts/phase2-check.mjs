import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const htmlFiles = fs.readdirSync(root).filter(name => name.endsWith('.html'));
const jsDir = path.join(root, 'js');
const jsFiles = fs.readdirSync(jsDir).filter(name => name.endsWith('.js')).map(name => `js/${name}`);
const runtimeFiles = [...htmlFiles, ...jsFiles];
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];

function requireCondition(condition, message) {
  if (!condition) failures.push(message);
}

const forbiddenRuntime = [
  ['firebasejs', 'Firebase CDN runtime'],
  ['firebase-config.js', 'legacy Firebase adapter reference'],
  ['MOCK_PROPERTIES', 'mock property inventory'],
  ['renoleads_buffered_inquiries', 'local PII inquiry buffer'],
  ['submitLeadToFirestore', 'legacy Firestore inquiry writer'],
  ['firebase.firestore', 'direct Firestore runtime'],
  ['firebase.analytics', 'Firebase Analytics runtime']
];

for (const file of runtimeFiles) {
  const content = read(file);
  for (const [pattern, label] of forbiddenRuntime) {
    requireCondition(!content.includes(pattern), `${file}: contains ${label}`);
  }
  if (file.endsWith('.js')) {
    try {
      new Function(content);
    } catch (error) {
      failures.push(`${file}: JavaScript syntax error: ${error.message}`);
    }
  }
}

for (const legacy of [
  'js/firebase-config.js',
  'firestore.rules',
  'firestore.indexes.json',
  'storage.rules',
  'functions/package.json',
  'functions/src/index.js'
]) {
  requireCondition(!fs.existsSync(path.join(root, legacy)), `${legacy}: legacy backend file still exists`);
}

const config = read('js/config.js');
const api = read('js/nj125-api.js');
const inquiry = read('js/inquiry-form.js');
const properties = read('js/properties.js');
const details = read('js/property-details.js');
const privacy = read('privacy.html');
const firebase = JSON.parse(read('firebase.json'));

requireCondition(config.includes('https://dnsgfsgpopniqeuqfslp.supabase.co/functions/v1/api'), 'config: NJ125 Edge endpoint missing');
requireCondition(config.includes('privacyNoticeVersion: "2026-08-22"'), 'config: privacy notice version missing');
requireCondition(api.includes('"public-properties"'), 'api: public-properties action missing');
requireCondition(api.includes('"submit-property-inquiry"'), 'api: submit-property-inquiry action missing');
requireCondition(api.includes('consent: {'), 'api: consent payload missing');
requireCondition(api.includes('attribution: getAttribution()'), 'api: attribution payload missing');
requireCondition(api.includes('credentials: "omit"'), 'api: public request must omit browser credentials');
requireCondition(inquiry.includes('submitInquiryToNJ125'), 'inquiry: NJ125 submission path missing');
requireCondition(!inquiry.includes('localStorage'), 'inquiry: form handler must not persist PII locally');
requireCondition(properties.includes('fetchPublishedProperties'), 'properties: authoritative feed missing');
requireCondition(!details.includes('Payment estimator') && !details.includes('calc-total-price'), 'property details: unsupported payment estimator remains');
requireCondition(privacy.includes('Last updated: August 22, 2026'), 'privacy: notice date does not match configured version');
requireCondition(Boolean(firebase.hosting), 'firebase.json: hosting configuration missing');
requireCondition(!Object.hasOwn(firebase, 'functions'), 'firebase.json: Functions backend still configured');
requireCondition(!Object.hasOwn(firebase, 'firestore'), 'firebase.json: Firestore backend still configured');
requireCondition(!Object.hasOwn(firebase, 'storage'), 'firebase.json: Storage backend still configured');

if (failures.length) {
  console.error('Phase 2 verification FAILED');
  failures.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}

console.log(`Phase 2 verification passed (${runtimeFiles.length} runtime files checked).`);
