import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const required = [
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'firebase.json',
  'src/main.tsx',
  'src/App.tsx',
  'src/styles/app.css',
  'src/styles/forms.css',
  'src/hooks/useScrollReveal.ts',
  'src/lib/propertyApi.ts',
  'src/components/InquiryForm.tsx',
  'src/components/PropertyCard.tsx',
  'src/pages/HomePage.tsx',
  'src/pages/PropertiesPage.tsx',
  'src/pages/PropertyPage.tsx',
  'src/pages/ContactPage.tsx',
  'public/.well-known/assetlinks.json',
];
required.forEach((file) => assert(exists(file), `Missing production file: ${file}`));

const pkg = JSON.parse(read('package.json'));
assert(pkg.dependencies?.react, 'React dependency is required');
assert(pkg.dependencies?.['react-dom'], 'React DOM dependency is required');
assert(pkg.dependencies?.['react-router-dom'], 'React Router dependency is required');
assert(pkg.devDependencies?.typescript, 'TypeScript dependency is required');
assert(pkg.devDependencies?.vite, 'Vite dependency is required');
assert(!pkg.dependencies?.firebase && !pkg.devDependencies?.firebase, 'Firebase SDK must not be a RenoLeads runtime/build dependency');
assert(!pkg.dependencies?.['@supabase/supabase-js'], 'RenoLeads must call the Edge API, not Supabase tables through supabase-js');

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
const main = read('src/main.tsx');
const styles = `${read('src/styles/app.css')}\n${read('src/styles/forms.css')}`;

assert(source.includes('https://dnsgfsgpopniqeuqfslp.supabase.co/functions/v1/api'), 'Public Edge endpoint is missing');
assert(source.includes("'public-properties'"), 'public-properties action is missing');
assert(source.includes("'submit-property-inquiry'"), 'submit-property-inquiry action is missing');
assert(source.includes('privacyNoticeVersion'), 'Privacy notice version evidence is missing');
assert(source.includes('utmCampaign') && source.includes('referrer'), 'Attribution fields are missing');
assert(!/MOCK_PROPERTIES|sample-res|sample-farm|sample-com/i.test(source), 'Runtime mock inventory is forbidden');
assert(!/localStorage\.setItem\([^\n]*(fullName|mobile|email|message|inquiry)/i.test(source), 'Inquiry PII must not be persisted in localStorage');
assert(!/firebase(app|\.firestore|\.analytics|Config)/i.test(source), 'Firebase runtime code is forbidden');
assert(!/service_role|sb_secret_|SUPABASE_SERVICE_ROLE_KEY/i.test(source), 'Server secrets must not appear in browser source');
assert(!/917 123 4567|info@renoleads\.com/i.test(source), 'Placeholder contact data must not ship in browser source');
assert(!/\bnj125\b/i.test(source), 'NJ125 branding must not appear in RenoLeads frontend source');
assert(sourceFiles.every((file) => !/nj125/i.test(file)), 'NJ125 branding must not appear in RenoLeads frontend file paths');
assert(!app.includes('.html'), 'Legacy .html compatibility routes must not return');
assert(main.includes("'./styles/app.css'") && main.includes("'./styles/forms.css'"), 'Active styles must live under src/styles');
assert(styles.includes("font-family: var(--font-body)") || styles.includes("--font-body: 'Poppins'"), 'Poppins typography foundation is missing');
assert(styles.includes('[data-reveal]'), 'Scroll reveal styling is missing');
assert(source.includes('IntersectionObserver'), 'Scroll reveal observer is missing');

const forbiddenLegacy = [
  'css',
  '.firebaserc.example',
  'scripts/phase3-check.mjs',
  '.github/workflows/phase3.yml',
  'contact.html', 'properties.html', 'property.html', 'privacy.html', 'buying-process.html', 'why-invest.html',
  'js/app.js', 'js/config.js', 'js/nj125-api.js', 'js/inquiry-form.js', 'js/properties.js', 'js/property-details.js', 'js/analytics.js',
  'src/lib/nj125Api.ts',
  '.well-known/assetlinks.json',
];
forbiddenLegacy.forEach((file) => assert(!exists(file), `Legacy path must be removed: ${file}`));

console.log(`RenoLeads verification passed: ${sourceFiles.length} typed source files checked.`);
