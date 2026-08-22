import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const imageTags = (source) => [...source.matchAll(/<img\b/g)].flatMap((match) => {
  const start = match.index ?? -1;
  if (start < 0) return [];
  const end = source.indexOf('/>', start);
  return end < 0 ? [] : [source.slice(start, end + 2)];
});
const hasImageAttr = (tag, name, value) => new RegExp(`${name}\\s*=\\s*["']${value}["']`).test(tag);
const hasNumericJsxAttr = (tag, name) => new RegExp(`${name}\\s*=\\s*\\{\\d+\\}`).test(tag);

const required = [
  'package.json', 'tsconfig.json', 'vite.config.ts', 'firebase.json', 'src/main.tsx', 'src/App.tsx',
  'src/styles/app.css', 'src/styles/forms.css', 'src/hooks/useScrollReveal.ts', 'src/lib/propertyApi.ts',
  'src/components/InquiryForm.tsx', 'src/components/PropertyCard.tsx', 'src/pages/HomePage.tsx',
  'src/pages/PropertiesPage.tsx', 'src/pages/PropertyPage.tsx', 'src/pages/ContactPage.tsx',
  'public/.well-known/assetlinks.json'
];
required.forEach((file) => assert(exists(file), `Missing production file: ${file}`));

const pkg = JSON.parse(read('package.json'));
assert(pkg.dependencies?.react, 'React dependency is required');
assert(pkg.dependencies?.['react-dom'], 'React DOM dependency is required');
assert(pkg.dependencies?.['react-router-dom'], 'React Router dependency is required');
assert(pkg.devDependencies?.typescript, 'TypeScript dependency is required');
assert(pkg.devDependencies?.vite, 'Vite dependency is required');
assert(!pkg.dependencies?.firebase && !pkg.devDependencies?.firebase, 'Firebase SDK must not be a RenoLeads runtime/build dependency');
assert(!pkg.dependencies?.['@supabase/supabase-js'], 'RenoLeads must not include the Supabase client SDK');

const firebase = JSON.parse(read('firebase.json'));
assert(firebase.hosting?.public === 'dist', 'Firebase Hosting must serve dist/');
assert(Array.isArray(firebase.hosting?.rewrites) && firebase.hosting.rewrites.some((rule) => rule.source === '**' && rule.destination === '/index.html'), 'SPA rewrite is required');
assert(!firebase.firestore && !firebase.storage && !firebase.functions, 'Firebase must remain hosting-only');

const sourceFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const relative = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(relative);
    else if (/\.(ts|tsx)$/.test(entry.name)) sourceFiles.push(relative);
  }
}
walk('src');
const source = sourceFiles.map(read).join('\n');
const app = read('src/App.tsx');
const api = read('src/lib/propertyApi.ts');
const main = read('src/main.tsx');
const styles = `${read('src/styles/app.css')}\n${read('src/styles/forms.css')}`;
const firebaseText = read('firebase.json');
const propertyCard = read('src/components/PropertyCard.tsx');
const homePage = read('src/pages/HomePage.tsx');
const propertyPage = read('src/pages/PropertyPage.tsx');

assert(source.includes('https://dnsgfsgpopniqeuqfslp.supabase.co/functions/v1/api'), 'Public Edge endpoint is missing');
assert(api.includes("new Set(['public-properties', 'submit-property-inquiry'])"), 'Public action allowlist is missing');
assert(api.includes('AbortController'), 'Public API timeout control is missing');
assert(/credentials\s*:\s*['"]omit['"]/.test(api), 'Public API must omit credentials');
assert(/cache\s*:\s*['"]no-store['"]/.test(api), 'Public API must disable cache');
assert(api.includes('responseLimitBytes'), 'Public API response-size cap is missing');
assert(api.includes('content-type'), 'Public API response content-type validation is missing');
assert(source.includes('privacyNoticeVersion'), 'Privacy notice version evidence is missing');
assert(source.includes('utmCampaign') && source.includes('referrer'), 'Attribution fields are missing');
assert(!/MOCK_PROPERTIES|sample-res|sample-farm|sample-com/i.test(source), 'Runtime mock inventory is forbidden');
assert(!/localStorage\.setItem\([^\n]*(fullName|mobile|email|message|inquiry)/i.test(source), 'Inquiry PII must not be persisted in localStorage');
assert(!/firebase(app|\.firestore|\.analytics|Config)/i.test(source), 'Firebase runtime code is forbidden');
assert(!/service_role|sb_secret_|SUPABASE_SERVICE_ROLE_KEY/i.test(source), 'Server secrets must not appear in browser source');
assert(!/signIn|signOut|auth\.|getSession|access_token|Authorization/i.test(source), 'RenoLeads must remain unauthenticated/public-only');
assert(!/admin|dashboard|staff-api/i.test(app), 'RenoLeads must not expose an admin/staff route');
assert(!/\bnj125\b/i.test(source), 'NJ125 branding must not appear in RenoLeads frontend source');
assert(sourceFiles.every((file) => !/nj125/i.test(file)), 'NJ125 branding must not appear in RenoLeads frontend file paths');
assert(!app.includes('.html'), 'Legacy .html compatibility routes must not return');
assert(main.includes("'./styles/app.css'") && main.includes("'./styles/forms.css'"), 'Active styles must live under src/styles');
assert(styles.includes('font-family: var(--font-body)') || styles.includes("--font-body: 'Poppins'"), 'Poppins typography foundation is missing');
assert(styles.includes('[data-reveal]'), 'Scroll reveal styling is missing');
assert(source.includes('IntersectionObserver'), 'Scroll reveal observer is missing');

const cardImages = imageTags(propertyCard);
assert(cardImages.length > 0, 'Property cards must render an image element');
assert(cardImages.every((tag) => hasImageAttr(tag, 'loading', 'lazy') && hasImageAttr(tag, 'decoding', 'async') && hasImageAttr(tag, 'fetchPriority', 'low') && hasNumericJsxAttr(tag, 'width') && hasNumericJsxAttr(tag, 'height')), 'Property card images must reserve dimensions and use lazy/async/low-priority loading');

const homeImages = imageTags(homePage);
assert(homeImages.length >= 2, 'Homepage image elements are missing');
assert(homeImages.every((tag) => hasImageAttr(tag, 'decoding', 'async') && hasNumericJsxAttr(tag, 'width') && hasNumericJsxAttr(tag, 'height')), 'Homepage images must reserve dimensions and asynchronously decode');
assert(homeImages.some((tag) => hasImageAttr(tag, 'loading', 'eager') && hasImageAttr(tag, 'fetchPriority', 'high')), 'Homepage LCP image priority controls are missing');
assert(homeImages.some((tag) => hasImageAttr(tag, 'loading', 'lazy') && hasImageAttr(tag, 'fetchPriority', 'low')), 'Below-the-fold homepage image controls are missing');

const detailImages = imageTags(propertyPage);
assert(detailImages.length >= 2, 'Property detail image elements are missing');
assert(detailImages.every((tag) => hasImageAttr(tag, 'decoding', 'async') && hasNumericJsxAttr(tag, 'width') && hasNumericJsxAttr(tag, 'height')), 'Property detail images must reserve dimensions and asynchronously decode');
assert(detailImages.some((tag) => hasImageAttr(tag, 'loading', 'eager') && hasImageAttr(tag, 'fetchPriority', 'high')), 'Property detail primary image priority controls are missing');
assert(detailImages.some((tag) => hasImageAttr(tag, 'loading', 'lazy') && hasImageAttr(tag, 'fetchPriority', 'low')), 'Property detail thumbnail loading controls are missing');

for (const header of ['Strict-Transport-Security', 'Cross-Origin-Resource-Policy', 'X-Permitted-Cross-Domain-Policies', 'Content-Security-Policy']) {
  assert(firebaseText.includes(header), `${header} is missing from Firebase Hosting headers`);
}
assert(firebaseText.includes('https://dnsgfsgpopniqeuqfslp.supabase.co'), 'CSP must use the exact Supabase project origin');
assert(!firebaseText.includes('https://*.supabase.co'), 'Wildcard Supabase CSP origins are forbidden');

const forbiddenLegacy = [
  'css', '.firebaserc.example', 'scripts/phase3-check.mjs', '.github/workflows/phase3.yml',
  'contact.html', 'properties.html', 'property.html', 'privacy.html', 'buying-process.html', 'why-invest.html',
  'js/app.js', 'js/config.js', 'js/nj125-api.js', 'js/inquiry-form.js', 'js/properties.js', 'js/property-details.js', 'js/analytics.js',
  'src/lib/nj125Api.ts', '.well-known/assetlinks.json'
];
forbiddenLegacy.forEach((file) => assert(!exists(file), `Legacy path must be removed: ${file}`));

console.log(`RenoLeads verification passed: ${sourceFiles.length} typed source files checked.`);
