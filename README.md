# renoleads

Public land-lot discovery and inquiry frontend for NJ125 Corporation.

## Production

```text
https://renoleads-11e2b.web.app
```

The repository is bound to Firebase project `renoleads-11e2b` through `.firebaserc`.

## Architecture

renoleads and NJ125 remain separate applications and repositories while sharing one dedicated Supabase backend.

```text
renoleads
React + TypeScript + Vite
Firebase Hosting only
        ↓
NJ125 Supabase Edge API
        ↓
Supabase PostgreSQL / Auth / Storage / Edge Functions
        ↑
NJ125 Operations
React + TypeScript + Vite
Firebase Hosting only
```

renoleads never talks directly to NJ125 database tables. Public browser access is limited to the Edge API actions `public-properties` and `submit-property-inquiry`.

## Frontend

- React 19 + TypeScript
- Vite production build
- React Router with clean routes only
- Poppins typography throughout
- lowercase `renoleads` wordmark in Poppins SemiBold
- responsive property discovery and inquiry UI
- accessible IntersectionObserver-based scroll reveals with reduced-motion support
- one shared inventory fetch through React context
- typed controlled inquiry form
- saved/recent lot IDs as optional non-PII browser convenience state
- no inquiry PII browser buffering
- no runtime mock inventory
- no Firebase SDK
- no Firestore, Firebase Auth, Firebase Storage, or Cloud Functions backend
- Firebase Hosting serves only `dist/`

Active styles live under `src/styles/`. The former root `css/` bundle and old `.html` compatibility routes have been removed.

## Routes

```text
/
/properties
/property/:id
/contact
/privacy
/buying-process
/why-polomolok
```

## Shared backend contract

Endpoint:

```text
https://dnsgfsgpopniqeuqfslp.supabase.co/functions/v1/api
```

Public inventory:

```json
{
  "action": "public-properties",
  "payload": {}
}
```

Public inquiry:

```json
{
  "action": "submit-property-inquiry",
  "payload": {
    "propertyId": "optional NJ125 lot UUID",
    "fullName": "...",
    "mobileNumber": "...",
    "email": "optional",
    "inquiryType": "...",
    "preferredDate": "optional YYYY-MM-DD",
    "preferredContactMethod": "...",
    "message": "optional",
    "consent": {
      "accepted": true,
      "noticeVersion": "2026-08-22"
    },
    "attribution": {
      "source": "renoleads",
      "landingPage": "...",
      "referrer": "...",
      "utmSource": "...",
      "utmMedium": "...",
      "utmCampaign": "...",
      "utmContent": "...",
      "utmTerm": "..."
    }
  }
}
```

The public response exposes only an opaque request reference. Internal inquiry and lead identifiers are not returned to the browser.

## Development

Requires Node.js 22.12 or newer.

```bash
npm ci
npm run dev
```

Complete verification:

```bash
npm run verify
```

This runs strict TypeScript, the production architecture/security gate, and the Vite build. The production output is written to `dist/`.

## Firebase Hosting deployment

Firebase is hosting only.

```bash
firebase login
firebase use renoleads-11e2b
npm ci
npm run verify
firebase deploy --only hosting
```

Do not commit Firebase access tokens, service-account credentials, Supabase secret keys, or service-role credentials.

`firebase.json` includes the SPA rewrite, immutable caching for hashed assets, no-cache HTML, CSP, frame protection, referrer policy, permissions policy, and COOP headers.

## Production smoke verification

`node scripts/production-smoke.mjs` validates the deployed Firebase application from an external network path. CI verifies:

- `/`, `/properties`, `/contact`, `/privacy`, and a clean `/property/:id` route return the React SPA
- security headers are present
- `/.well-known/assetlinks.json` is served as JSON
- the NJ125 `public-properties` Edge action accepts `Origin: https://renoleads-11e2b.web.app`
- Edge CORS preflight succeeds
- a deliberately consent-rejected inquiry reaches the live API and returns `consent-required` without creating production inquiry/lead records

## Privacy and retention

The Privacy Notice version used by the inquiry contract is `2026-08-22`.

renoleads may store only:

- saved NJ125 lot IDs in local storage
- recently viewed NJ125 lot IDs in local storage
- first-touch landing/referrer/UTM attribution in session storage

Names, mobile numbers, email addresses, inquiry messages, and other inquiry PII are never buffered locally when a submission fails.

## Data state

renoleads does not ship sample properties. If NJ125 has no published available lots, the catalog intentionally displays an empty state.
